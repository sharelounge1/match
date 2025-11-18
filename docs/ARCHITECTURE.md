# MatchUp - 기술 아키텍처 문서

**버전**: 1.0
**최종 수정일**: 2025-01-18

---

## 1. 시스템 개요

MatchUp은 '아이디어를 가진 사람'과 '기술을 가진 사람'을 지분/수익 공유 방식으로 연결하는 협업 매칭 플랫폼입니다.

### 1.1. 핵심 인프라 구성

| 구성 요소 | 기술 | 설명 |
|---------|------|------|
| **Database** | Supabase (PostgreSQL) | 메인 데이터베이스, 인증, 실시간 구독 |
| **Backend API** | Supabase Edge Functions | 서버리스 API, 비즈니스 로직 |
| **Web Application** | Render.com | React SPA 호스팅, CDN |
| **Storage** | Supabase Storage | 이미지, 문서, 포트폴리오 파일 |
| **Auth** | Supabase Auth | 소셜 로그인, JWT 기반 인증 |
| **Realtime** | Supabase Realtime | 알림, 메시지, 실시간 업데이트 |

---

## 2. 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐    ┌───────────────────┐                 │
│  │   Web Browser     │    │   Mobile PWA      │                 │
│  │   (React SPA)     │    │   (React SPA)     │                 │
│  └─────────┬─────────┘    └─────────┬─────────┘                 │
│            │                        │                            │
│            └──────────┬─────────────┘                            │
│                       │                                          │
│                       ▼                                          │
│            ┌─────────────────────┐                               │
│            │   Render.com CDN    │                               │
│            │   (Static Hosting)  │                               │
│            └─────────┬───────────┘                               │
└──────────────────────┼──────────────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Supabase   │  │  Supabase   │  │  Supabase   │              │
│  │    Auth     │  │   Realtime  │  │   Storage   │              │
│  │             │  │             │  │             │              │
│  │ • OAuth     │  │ • WebSocket │  │ • Images    │              │
│  │ • Email/PW  │  │ • Presence  │  │ • Documents │              │
│  │ • JWT       │  │ • Broadcast │  │ • Portfolio │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│  ┌───────────────────────────────────────────────────────┐      │
│  │              Edge Functions (Deno)                     │      │
│  │                                                        │      │
│  │  • 프로젝트 CRUD        • 지원/매칭 로직                   │      │
│  │  • 결제 처리 (Webhook)  • 계약서 생성                     │      │
│  │  • 알림 발송            • 이메일 전송                      │      │
│  │  • AI 검토 (OpenAI)     • PDF 생성                       │      │
│  └───────────────────────────┬───────────────────────────┘      │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────┐      │
│  │            PostgreSQL Database                         │      │
│  │                                                        │      │
│  │  • Users        • Projects      • Applications         │      │
│  │  • Contracts    • Payments      • Notifications        │      │
│  │  • Messages     • Reviews       • Portfolios           │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Stripe  │  │ SendGrid│  │ OpenAI  │  │ GitHub  │            │
│  │ 결제    │  │ 이메일   │  │ AI 검토  │  │ OAuth   │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 프론트엔드 아키텍처

### 3.1. 기술 스택

```yaml
Framework: React 18+ with TypeScript
Build Tool: Vite
State Management: Zustand
Server State: TanStack Query (React Query)
Routing: React Router v6
Styling: Tailwind CSS + shadcn/ui
Forms: React Hook Form + Zod
Real-time: Supabase Realtime Client
```

### 3.2. 프로젝트 구조

```
src/
├── components/
│   ├── ui/                    # shadcn/ui 기본 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── common/                # 공통 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── screens/               # 페이지 컴포넌트
│   │   ├── auth/
│   │   ├── home/
│   │   ├── project/
│   │   ├── profile/
│   │   ├── meeting/
│   │   └── contract/
│   └── layout/                # 레이아웃 컴포넌트
│       ├── MainLayout.tsx
│       ├── AuthLayout.tsx
│       └── DashboardLayout.tsx
├── stores/                    # Zustand 스토어
│   ├── authStore.ts
│   ├── projectStore.ts
│   ├── notificationStore.ts
│   └── uiStore.ts
├── hooks/                     # 커스텀 훅
│   ├── useAuth.ts
│   ├── useProject.ts
│   ├── useRealtime.ts
│   └── usePayment.ts
├── services/                  # API 서비스
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── authService.ts
│   ├── projectService.ts
│   ├── paymentService.ts
│   └── contractService.ts
├── types/                     # TypeScript 타입
│   ├── user.ts
│   ├── project.ts
│   ├── application.ts
│   └── contract.ts
├── utils/                     # 유틸리티 함수
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── lib/                       # 라이브러리 설정
│   └── queryClient.ts
├── routes/                    # 라우팅 설정
│   └── AppRouter.tsx
└── App.tsx
```

### 3.3. 상태 관리 전략

```typescript
// 전역 상태 (Zustand) - 클라이언트 전용 상태
- authStore: 사용자 인증 상태, 프로필
- uiStore: 모달, 토스트, 로딩 상태
- notificationStore: 알림 목록, 읽음 상태

// 서버 상태 (TanStack Query) - API 데이터
- 프로젝트 목록/상세
- 지원자 목록
- 계약서 정보
- 메시지/채팅
```

---

## 4. 백엔드 아키텍처 (Supabase)

### 4.1. Edge Functions 구조

```
supabase/
├── functions/
│   ├── auth/
│   │   ├── signup-complete/      # 회원가입 완료 후 처리
│   │   └── delete-account/       # 계정 삭제
│   ├── projects/
│   │   ├── create-project/       # 프로젝트 생성 + 결제
│   │   ├── close-project/        # 프로젝트 마감
│   │   └── analyze-project/      # AI 타당성 검토
│   ├── applications/
│   │   ├── apply-project/        # 프로젝트 지원
│   │   ├── accept-application/   # 지원 수락 + 결제
│   │   └── reject-application/   # 지원 거절
│   ├── meetings/
│   │   ├── create-meeting/       # 미팅 생성
│   │   └── complete-meeting/     # 미팅 완료
│   ├── contracts/
│   │   ├── generate-contract/    # 계약서 생성
│   │   ├── sign-contract/        # 전자서명
│   │   └── download-contract/    # PDF 다운로드
│   ├── payments/
│   │   ├── create-payment/       # 결제 생성
│   │   ├── stripe-webhook/       # Stripe 웹훅
│   │   └── refund/               # 환불 처리
│   └── notifications/
│       ├── send-push/            # 푸시 알림
│       └── send-email/           # 이메일 발송
└── migrations/                    # DB 마이그레이션
```

### 4.2. Row Level Security (RLS) 정책

```sql
-- 사용자 본인 데이터만 접근
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 프로젝트 소유자만 지원자 관리
CREATE POLICY "Project owners can manage applications"
ON applications FOR ALL
USING (
  project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()
  )
);

-- 계약 당사자만 계약서 접근
CREATE POLICY "Contract parties can view contracts"
ON contracts FOR SELECT
USING (
  auth.uid() = party1_id OR auth.uid() = party2_id
);
```

### 4.3. 데이터베이스 트리거

```sql
-- 새 사용자 생성 시 프로필 자동 생성
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 지원 수락 시 알림 발송
CREATE FUNCTION notify_application_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO notifications (user_id, type, content)
    VALUES (NEW.applicant_id, 'application_accepted', '지원이 수락되었습니다.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. 인증 및 보안

### 5.1. 인증 흐름

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Supabase   │────▶│  Database   │
│             │     │    Auth     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │  1. Login Request  │                    │
      │───────────────────▶│                    │
      │                    │  2. Verify User    │
      │                    │───────────────────▶│
      │                    │◀───────────────────│
      │  3. JWT Token      │                    │
      │◀───────────────────│                    │
      │                    │                    │
      │  4. API Request    │                    │
      │  (with JWT)        │                    │
      │───────────────────▶│  5. Verify & Query │
      │                    │───────────────────▶│
      │  6. Response       │◀───────────────────│
      │◀───────────────────│                    │
```

### 5.2. 지원 인증 방식

| 방식 | 설명 | 용도 |
|------|------|------|
| Email/Password | 기본 이메일 인증 | 일반 회원가입 |
| Google OAuth | Google 계정 연동 | 소셜 로그인 |
| GitHub OAuth | GitHub 계정 연동 | 개발자 인증/포트폴리오 |
| Kakao OAuth | 카카오 계정 연동 | 국내 사용자 편의 |

### 5.3. 보안 고려사항

```yaml
JWT 설정:
  - Access Token 만료: 1시간
  - Refresh Token 만료: 7일
  - Secure Cookie 사용

API 보안:
  - Rate Limiting: 100 req/min per user
  - CORS: 허용된 도메인만
  - Input Validation: Zod 스키마 검증

데이터 보안:
  - RLS 정책 적용 (모든 테이블)
  - 민감 정보 암호화 (계약서, 결제 정보)
  - 파일 업로드 검증 (확장자, 크기)
```

---

## 6. 결제 시스템 아키텍처

### 6.1. 결제 흐름

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Client  │───▶│  Edge   │───▶│ Stripe  │───▶│ Webhook │
│         │    │Function │    │   API   │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     │ 1. 결제 요청  │              │              │
     │─────────────▶│              │              │
     │              │ 2. Intent    │              │
     │              │─────────────▶│              │
     │ 3. Client    │              │              │
     │   Secret     │◀─────────────│              │
     │◀─────────────│              │              │
     │              │              │              │
     │ 4. Confirm   │              │              │
     │─────────────────────────────▶              │
     │              │              │ 5. Event     │
     │              │              │─────────────▶│
     │              │              │              │ 6. Update DB
     │              │              │              │─────────┐
     │              │              │              │◀────────┘
     │ 7. Success   │              │              │
     │◀──────────────────────────────────────────│
```

### 6.2. 과금 항목

| 항목 | 금액 | 트리거 |
|------|------|--------|
| 프로젝트 업로드 | 5,000원 | 프로젝트 등록 완료 시 |
| 미팅 성사 수수료 | 10,000원 | 게시자가 지원 수락 시 |
| 계약서 발급 | 3,000원 (선택) | 계약서 생성 요청 시 |

---

## 7. 실시간 기능

### 7.1. Supabase Realtime 구현

```typescript
// 알림 구독
const subscribeToNotifications = (userId: string) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        // 새 알림 처리
        showToast(payload.new.content);
      }
    )
    .subscribe();
};

// 채팅 메시지 구독
const subscribeToChatRoom = (roomId: string) => {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        // 새 메시지 추가
        addMessage(payload.new);
      }
    )
    .subscribe();
};
```

### 7.2. 실시간 기능 목록

- **알림**: 지원/수락/거절/계약 등 이벤트 알림
- **채팅**: 1:1 및 그룹 채팅
- **프로젝트 업데이트**: 새 지원자, 상태 변경
- **Presence**: 사용자 온라인 상태

---

## 8. 배포 아키텍처

### 8.1. Render.com 설정

```yaml
# render.yaml
services:
  - type: web
    name: matchup-web
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false
      - key: VITE_STRIPE_PUBLIC_KEY
        sync: false
```

### 8.2. 환경 변수

```bash
# Frontend (Render.com)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_APP_URL=https://matchup.onrender.com

# Supabase Edge Functions
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SENDGRID_API_KEY=SG.xxxxx
OPENAI_API_KEY=sk-xxxxx
```

### 8.3. CI/CD 파이프라인

```yaml
# GitHub Actions
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## 9. 모니터링 및 로깅

### 9.1. 모니터링 도구

| 도구 | 용도 | 설정 |
|------|------|------|
| Supabase Dashboard | DB/Auth/Storage 모니터링 | 기본 제공 |
| Render Metrics | 웹 앱 성능, 에러율 | 기본 제공 |
| Sentry | 에러 트래킹, 성능 | 프론트엔드 SDK |
| LogDNA | 로그 수집, 분석 | Edge Function 연동 |

### 9.2. 알림 설정

```yaml
Critical Alerts (즉시 알림):
  - 결제 실패율 > 5%
  - API 에러율 > 10%
  - 응답 시간 > 3초

Warning Alerts (1시간 내):
  - DB 연결 풀 > 80%
  - Storage 용량 > 80%
  - 일일 API 호출 한도 접근
```

---

## 10. 확장성 고려사항

### 10.1. 현재 아키텍처 한계

```yaml
Supabase Free/Pro 제한:
  - Database: 500MB (Free) / 8GB (Pro)
  - Storage: 1GB (Free) / 100GB (Pro)
  - Edge Functions: 500K invocations/month
  - Realtime: 200 concurrent connections

Render.com 제한:
  - Free: 750 hours/month
  - Starter: $7/month, 무제한
```

### 10.2. 확장 전략

```yaml
Phase 1 (MVP - 현재):
  - Supabase Pro
  - Render Starter
  - 예상 비용: $50-100/month

Phase 2 (성장기):
  - Supabase Pro + 추가 리소스
  - Render Standard (Auto-scaling)
  - CDN 최적화
  - 예상 비용: $200-500/month

Phase 3 (스케일업):
  - Supabase Enterprise
  - 별도 Redis 캐시 (Upstash)
  - Queue 서비스 (BullMQ)
  - 예상 비용: $1000+/month
```

---

## 11. 개발 환경 설정

### 11.1. 로컬 개발 환경

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-org/matchup.git
cd matchup

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. Supabase CLI 설치 및 실행
npm install -g supabase
supabase start

# 5. 개발 서버 실행
npm run dev
```

### 11.2. Supabase 로컬 설정

```bash
# Supabase 로컬 시작
supabase start

# DB 마이그레이션 실행
supabase db reset

# Edge Functions 로컬 실행
supabase functions serve

# 시드 데이터 삽입
supabase db seed
```

---

## 12. 기술 결정 근거

### 12.1. 왜 Supabase인가?

| 장점 | 설명 |
|------|------|
| **올인원 솔루션** | DB, Auth, Storage, Realtime, Functions 통합 |
| **PostgreSQL** | 강력한 RLS, 복잡한 쿼리, JSON 지원 |
| **개발 속도** | 자동 생성 API, 즉시 사용 가능한 Auth |
| **비용 효율** | 스타트업 친화적 가격, 무료 티어 충분 |
| **확장성** | Enterprise로 마이그레이션 용이 |

### 12.2. 왜 Render.com인가?

| 장점 | 설명 |
|------|------|
| **간편한 배포** | Git 연동으로 자동 배포 |
| **정적 호스팅** | SPA에 최적화, 글로벌 CDN |
| **가격** | 합리적인 가격, 무료 티어 |
| **관리 편의** | 직관적 대시보드, 로그 확인 |

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
