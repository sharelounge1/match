# MatchUp - Supabase 설정 가이드

## 1. Storage 버킷 생성

Supabase Dashboard > Storage에서 아래 버킷들을 생성하세요.

### 버킷 목록

| 버킷 이름 | 공개 여부 | 용도 | 파일 크기 제한 |
|-----------|----------|------|--------------|
| `avatars` | Public | 사용자 프로필 이미지 | 2MB |
| `portfolios` | Public | 포트폴리오 이미지 | 5MB |
| `projects` | Public | 프로젝트 스크린샷 | 5MB |
| `attachments` | Private | 채팅 첨부 파일 | 10MB |
| `contracts` | Private | 계약서 PDF | 10MB |
| `signatures` | Private | 전자서명 이미지 | 1MB |

### 버킷 생성 방법

1. Supabase Dashboard 접속
2. 왼쪽 메뉴에서 **Storage** 클릭
3. **New bucket** 클릭
4. 버킷 이름 입력
5. Public 버킷은 "Public bucket" 체크
6. **Create bucket** 클릭

---

## 2. Storage RLS 정책

각 버킷에 대해 SQL Editor에서 아래 정책을 실행하세요.

```sql
-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- AVATARS 버킷 정책
-- 누구나 읽기 가능
CREATE POLICY "avatars_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- 본인만 업로드 가능
CREATE POLICY "avatars_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 본인만 수정 가능
CREATE POLICY "avatars_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 본인만 삭제 가능
CREATE POLICY "avatars_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- PORTFOLIOS 버킷 정책
CREATE POLICY "portfolios_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolios');

CREATE POLICY "portfolios_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolios'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "portfolios_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'portfolios'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "portfolios_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolios'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- PROJECTS 버킷 정책
CREATE POLICY "projects_select_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'projects');

CREATE POLICY "projects_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'projects'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "projects_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'projects'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "projects_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'projects'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ATTACHMENTS 버킷 정책 (Private)
-- 채팅 참여자만 읽기 가능
CREATE POLICY "attachments_select_policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "attachments_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "attachments_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- CONTRACTS 버킷 정책 (Private)
-- 계약 당사자만 접근 가능
CREATE POLICY "contracts_select_policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'contracts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "contracts_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'contracts'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- SIGNATURES 버킷 정책 (Private)
CREATE POLICY "signatures_select_policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "signatures_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "signatures_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

---

## 3. Authentication 설정

### 3.1. Email Auth 설정

1. Authentication > Providers > Email
2. 아래 설정 확인:
   - Enable Email Signup: ON
   - Confirm email: ON (권장)
   - Secure email change: ON

### 3.2. OAuth Providers 설정 (선택)

#### Google
1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 생성
2. Supabase > Authentication > Providers > Google
3. Client ID와 Client Secret 입력
4. Redirect URL: `https://jgfmobrojsvmgkhoidvx.supabase.co/auth/v1/callback`

#### GitHub
1. [GitHub Developer Settings](https://github.com/settings/developers)에서 OAuth App 생성
2. Supabase > Authentication > Providers > GitHub
3. Client ID와 Client Secret 입력
4. Redirect URL: `https://jgfmobrojsvmgkhoidvx.supabase.co/auth/v1/callback`

#### Kakao
1. [Kakao Developers](https://developers.kakao.com/)에서 앱 생성
2. Supabase > Authentication > Providers > Kakao
3. REST API Key와 Client Secret 입력
4. Redirect URI: `https://jgfmobrojsvmgkhoidvx.supabase.co/auth/v1/callback`

### 3.3. URL Configuration

1. Authentication > URL Configuration
2. Site URL: `http://localhost:5173` (개발) 또는 프로덕션 URL
3. Redirect URLs:
   - `http://localhost:5173/**`
   - `https://your-production-url.com/**`

---

## 4. 데이터베이스 스키마 적용

### SQL Editor에서 실행

1. Supabase Dashboard > SQL Editor
2. New query 클릭
3. `/supabase/migrations/001_initial_schema.sql` 파일 내용 복사
4. Run 클릭

### 또는 Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref jgfmobrojsvmgkhoidvx

# 마이그레이션 실행
supabase db push
```

---

## 5. Edge Functions (선택)

결제, 계약서 생성 등 민감한 작업을 위한 Edge Functions:

### 필요한 Edge Functions

| 함수명 | 용도 |
|--------|------|
| `create-payment` | 결제 처리 (Stripe/PG 연동) |
| `create-contract` | 계약서 생성 |
| `sign-contract` | 계약서 서명 |
| `generate-contract-pdf` | PDF 생성 |
| `process-refund` | 환불 처리 |

### Edge Function 배포

```bash
# Edge Function 생성
supabase functions new create-payment

# 배포
supabase functions deploy create-payment

# 환경 변수 설정
supabase secrets set STRIPE_SECRET_KEY=sk_...
```

---

## 6. Realtime 설정

실시간 기능을 위한 테이블 설정:

1. Database > Replication
2. 아래 테이블에 Realtime 활성화:
   - `messages` - 채팅 메시지
   - `notifications` - 알림
   - `chat_rooms` - 채팅방 업데이트

---

## 7. 환경 변수 확인

프로젝트의 `.env` 파일:

```env
VITE_SUPABASE_URL=https://jgfmobrojsvmgkhoidvx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 8. 설정 체크리스트

- [ ] Storage 버킷 6개 생성
- [ ] Storage RLS 정책 적용
- [ ] Email 인증 설정
- [ ] OAuth 설정 (선택)
- [ ] URL Configuration 설정
- [ ] 데이터베이스 스키마 적용
- [ ] Realtime 테이블 설정
- [ ] 환경 변수 확인

---

## 문제 해결

### RLS 정책 오류
```sql
-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 정책 삭제 후 재생성
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Storage 업로드 오류
- 파일 경로가 `user_id/filename` 형식인지 확인
- 버킷이 올바르게 생성되었는지 확인
- RLS 정책이 적용되었는지 확인

### 인증 오류
- Redirect URL이 허용 목록에 있는지 확인
- Site URL이 올바른지 확인
