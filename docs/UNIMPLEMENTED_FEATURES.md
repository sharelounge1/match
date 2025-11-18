# MatchUp 미구현 기능 목록

> 개발자/운영자 관점에서 롤플레잉하여 파악한 미구현 기능들입니다.

---

## 1. 인증 및 회원가입 (Critical)

### 1.1 회원가입 (`pages/auth/signup.html`)
- [ ] **이메일 회원가입 기능**: Supabase Auth 연동 필요
- [ ] **소셜 로그인**: Google, GitHub, Kakao OAuth 연동
- [ ] **이메일 인증**: 이메일 발송 및 인증 확인 플로우
- [ ] **비밀번호 유효성 검사**: 8자 이상, 특수문자 포함 등
- [ ] **이용약관 동의 체크**: 체크 여부 확인

### 1.2 로그인 (`pages/auth/login.html`)
- [x] **이메일 로그인**: ✅ 구현됨
- [ ] **소셜 로그인**: Google, GitHub, Kakao OAuth 연동
- [ ] **로그인 유지하기**: Remember me 기능
- [ ] **로그인 실패 처리**: 에러 메시지 표시

### 1.3 비밀번호 관련
- [ ] **비밀번호 찾기** (`pages/auth/forgot-password.html`): 이메일 발송
- [ ] **비밀번호 재설정** (`pages/auth/reset-password.html`): 토큰 검증 및 변경

### 1.4 온보딩
- [ ] **역할 선택** (`pages/onboarding/role.html`): 프로필에 저장
- [ ] **프로필 설정** (`pages/onboarding/profile.html`): 기본 정보 입력

---

## 2. 프로필 관리

### 2.1 프로필 조회 (`pages/profile/index.html`)
- [ ] **내 프로필 로드**: Supabase에서 데이터 가져오기
- [ ] **포트폴리오 표시**: portfolios 테이블 연동
- [ ] **스킬 표시**: user_skills 테이블 연동
- [ ] **평점/리뷰 표시**: reviews 테이블 연동

### 2.2 프로필 편집 (`pages/profile/edit.html`)
- [x] **기본 정보 저장**: ✅ 구현됨
- [x] **프로필 사진 업로드**: ✅ 구현됨
- [x] **역할 선택**: ✅ 구현됨
- [x] **기술스택 입력**: ✅ 구현됨
- [x] **SNS 링크 저장**: ✅ 구현됨
- [ ] **DB 스키마 업데이트 필요**: location, skills, social_links 컬럼 추가 (마이그레이션 004 생성됨)

### 2.3 포트폴리오
- [ ] **포트폴리오 목록** (`pages/profile/portfolio.html`): 데이터 로드
- [ ] **포트폴리오 생성** (`pages/profile/portfolio-create.html`): 폼 제출
- [ ] **포트폴리오 수정** (`pages/profile/portfolio-edit.html`): 데이터 업데이트

---

## 3. 프로젝트 관리

### 3.1 프로젝트 탐색 (`pages/explore/index.html`)
- [ ] **프로젝트 목록 로드**: Supabase에서 active 프로젝트 가져오기
- [ ] **필터링 기능**: 카테고리, 역할, 단계별 필터
- [ ] **검색 기능**: 제목, 설명 검색
- [ ] **정렬 기능**: 최신순, 인기순
- [ ] **페이지네이션**: 무한 스크롤 또는 페이지 번호
- [ ] **북마크 기능**: bookmarks 테이블 연동

### 3.2 프로젝트 상세 (`pages/projects/detail.html`)
- [ ] **프로젝트 데이터 로드**: URL 파라미터로 ID 받아 로드
- [ ] **조회수 증가**: view_count 업데이트
- [ ] **북마크 토글**: 추가/삭제
- [ ] **지원 버튼**: 로그인 상태 확인, 이미 지원했는지 확인
- [ ] **소유자 프로필 표시**: profiles 테이블 join

### 3.3 프로젝트 등록 (`pages/projects/create.html`)
- [x] **모집 유형 선택**: ✅ UI 구현됨
- [x] **헤더 통일**: ✅ 구현됨
- [ ] **폼 데이터 저장**: Supabase projects 테이블에 저장
- [ ] **이미지 업로드**: Supabase Storage 연동
- [ ] **임시 저장**: draft 상태로 저장
- [ ] **결제 연동**: 유료 플랜 선택 시 마일리지 차감

### 3.4 프로젝트 수정 (`pages/projects/edit.html`)
- [ ] **기존 데이터 로드**: 프로젝트 ID로 데이터 가져오기
- [ ] **수정사항 저장**: Supabase 업데이트
- [ ] **프로젝트 삭제**: soft delete 또는 상태 변경

---

## 4. 지원 관리

### 4.1 프로젝트 지원 (`pages/projects/apply.html`)
- [ ] **지원서 제출**: applications 테이블에 저장
- [ ] **역할 선택**: 복수 선택 가능
- [ ] **자기소개 작성**: cover_letter 저장
- [ ] **포트폴리오 첨부**: 포트폴리오 선택
- [ ] **중복 지원 방지**: 기존 지원 여부 확인

### 4.2 지원자 목록 - 프로젝트 소유자용 (`pages/applicants/list.html`)
- [ ] **지원자 목록 로드**: 내 프로젝트의 지원자들
- [ ] **상태별 필터**: pending, reviewed, shortlisted 등
- [ ] **지원자 프로필 미리보기**: 기본 정보 표시

### 4.3 지원자 상세 (`pages/applicants/detail.html`)
- [ ] **지원서 상세 보기**: 자기소개, 포트폴리오
- [ ] **지원자 프로필**: 전체 프로필 정보
- [ ] **상태 변경**: 검토중, 후보자, 수락, 거절
- [ ] **메시지 보내기**: 채팅방 생성 또는 연결

---

## 5. 나의 프로젝트

### 5.1 등록한 프로젝트 (`pages/my-projects/posted.html`)
- [ ] **내가 등록한 프로젝트 목록**: owner_id로 필터
- [ ] **프로젝트 상태 표시**: draft, active, closed
- [ ] **지원자 수 표시**: application_count
- [ ] **프로젝트 관리 액션**: 수정, 일시정지, 종료

### 5.2 지원한 프로젝트 (`pages/my-projects/applied.html`)
- [ ] **내가 지원한 프로젝트 목록**: applicant_id로 필터
- [ ] **지원 상태 표시**: pending, accepted, rejected
- [ ] **지원 취소 기능**: withdrawn 상태로 변경

### 5.3 협업 중인 프로젝트 (`pages/my-projects/collaborating.html`)
- [ ] **수락된 프로젝트 목록**: 계약이 체결된 프로젝트
- [ ] **팀원 표시**: 함께 협업 중인 사람들
- [ ] **프로젝트 진행 상황**: 마일스톤, 진척도

---

## 6. 미팅 관리

### 6.1 미팅 목록 (`pages/meetings/index.html`)
- [x] **헤더 통일**: ✅ 구현됨
- [ ] **예정된 미팅 목록**: scheduled_at 기준 정렬
- [ ] **완료된 미팅 목록**: 히스토리
- [ ] **미팅 상태 표시**: scheduled, completed, cancelled

### 6.2 미팅 예약 (`pages/meetings/schedule.html`)
- [ ] **날짜/시간 선택**: 캘린더 UI
- [ ] **미팅 유형 선택**: video, phone, offline
- [ ] **미팅 생성**: meetings 테이블에 저장
- [ ] **알림 발송**: 상대방에게 알림

### 6.3 미팅 상세 (`pages/meetings/detail.html`)
- [ ] **미팅 정보 표시**: 일시, 유형, 참가자
- [ ] **미팅 링크**: 화상 미팅 URL
- [ ] **미팅 확정/취소**: 상태 변경
- [ ] **메모 작성**: 미팅 노트

### 6.4 미팅룸 (`pages/meetings/room.html`)
- [ ] **화상 미팅 연동**: WebRTC 또는 외부 서비스 (Zoom, Google Meet)
- [ ] **채팅 기능**: 실시간 채팅
- [ ] **화면 공유**: 필요시

---

## 7. 메시지/채팅

### 7.1 메시지 목록 (`pages/messages/index.html`)
- [x] **헤더 통일**: ✅ 구현됨
- [ ] **채팅방 목록 로드**: chat_participants로 내 채팅방 조회
- [ ] **마지막 메시지 표시**: last_message_preview
- [ ] **읽지 않은 메시지 수**: unread_count
- [ ] **실시간 업데이트**: Supabase Realtime 구독

### 7.2 채팅방 (`pages/messages/chat.html`)
- [ ] **메시지 목록 로드**: messages 테이블
- [ ] **메시지 전송**: 실시간 전송
- [ ] **파일 첨부**: 이미지, 파일 전송
- [ ] **읽음 표시**: last_read_at 업데이트

---

## 8. 계약 관리

### 8.1 계약 목록 (`pages/contracts/index.html`)
- [ ] **내 계약 목록**: party1_id 또는 party2_id로 조회
- [ ] **계약 상태 표시**: draft, pending, active

### 8.2 계약 생성 (`pages/contracts/create.html`)
- [ ] **계약 조건 설정**: 지분, 수익 배분, 역할
- [ ] **계약서 생성**: contracts 테이블에 저장
- [ ] **PDF 생성**: 계약서 문서화

### 8.3 계약 상세 (`pages/contracts/detail.html`)
- [ ] **계약 내용 표시**: 조건, 당사자 정보
- [ ] **서명 상태**: 양측 서명 여부
- [ ] **PDF 다운로드**: 계약서 파일

### 8.4 계약 서명 (`pages/contracts/sign.html`)
- [ ] **계약 내용 확인**: 조건 검토
- [ ] **전자 서명**: 서명 입력 또는 확인
- [ ] **계약 확정**: 양측 서명 완료 시 active 상태

---

## 9. 알림 시스템

### 9.1 알림 목록 (`pages/notifications/index.html`)
- [ ] **알림 목록 로드**: notifications 테이블
- [ ] **읽음 처리**: is_read 업데이트
- [ ] **알림 타입별 아이콘**: 지원, 미팅, 계약 등
- [ ] **실시간 알림**: Supabase Realtime 구독
- [ ] **알림 클릭 시 이동**: action_url로 라우팅

---

## 10. 결제/마일리지

### 10.1 마일리지 시스템
- [ ] **마일리지 충전**: 결제 후 mileage 증가
- [ ] **마일리지 사용**: 프로젝트 등록, 미팅 예약 등
- [ ] **거래 내역**: mileage_transactions 테이블
- [ ] **잔액 표시**: 헤더에 실시간 표시

### 10.2 결제 (`pages/payments/checkout.html`)
- [ ] **결제 수단 선택**: 카드, 계좌이체
- [ ] **결제 처리**: Stripe 또는 국내 PG 연동
- [ ] **결제 완료 처리**: payments 테이블 업데이트

### 10.3 결제 내역 (`pages/payments/index.html`)
- [ ] **결제 목록**: 내 결제 내역
- [ ] **영수증 다운로드**: receipt_url

---

## 11. 설정

### 11.1 계정 설정 (`pages/settings/account.html`)
- [ ] **이메일 변경**: Supabase Auth 업데이트
- [ ] **비밀번호 변경**: 현재 비밀번호 확인 후 변경
- [ ] **계정 삭제**: 탈퇴 처리

### 11.2 알림 설정 (`pages/settings/notifications.html`)
- [ ] **알림 설정 로드**: notification_settings
- [ ] **설정 변경**: 이메일, 푸시, SMS 토글

### 11.3 개인정보 설정 (`pages/settings/privacy.html`)
- [ ] **공개 범위 설정**: privacy_settings
- [ ] **프로필 공개 여부**: 이메일, 전화번호 등

### 11.4 결제 수단 관리 (`pages/settings/payment-methods.html`)
- [ ] **카드 등록/삭제**: Stripe Customer
- [ ] **기본 결제 수단 설정**

---

## 12. 공통 기능

### 12.1 헤더/네비게이션
- [x] **로그인 상태 헤더** (`pages/index.html`): ✅ 구현됨
- [ ] **모든 페이지 헤더 통일**: 일부 페이지 남음
- [ ] **로그아웃 기능**: 모든 페이지에서 가능

### 12.2 에러 처리
- [ ] **404 페이지**: 잘못된 URL
- [ ] **인증 필요 리다이렉트**: 로그인 필요 시
- [ ] **API 에러 표시**: 사용자 친화적 메시지

### 12.3 반응형 디자인
- [ ] **모바일 메뉴**: 햄버거 메뉴
- [ ] **터치 인터랙션**: 스와이프 등

---

## 우선순위 구현 목록

### Phase 1: 핵심 인증 및 프로필 (High Priority)
1. 회원가입 Supabase 연동
2. 로그인/로그아웃 완성
3. 프로필 조회/편집 DB 연동
4. 온보딩 플로우

### Phase 2: 프로젝트 기본 기능 (High Priority)
1. 프로젝트 목록 로드 (탐색)
2. 프로젝트 상세 로드
3. 프로젝트 등록 폼 제출
4. 프로젝트 지원 폼 제출

### Phase 3: 지원자 관리 (Medium Priority)
1. 지원자 목록/상세
2. 지원 상태 변경
3. 나의 프로젝트 페이지들

### Phase 4: 커뮤니케이션 (Medium Priority)
1. 메시지/채팅 기능
2. 알림 시스템
3. 미팅 예약/관리

### Phase 5: 계약 및 결제 (Lower Priority)
1. 계약서 생성/서명
2. 마일리지 시스템
3. 결제 연동

---

## 참고: 실행해야 할 마이그레이션

Supabase SQL Editor에서 다음 파일을 실행해야 합니다:

```
supabase/migrations/004_add_profile_fields.sql
```

이 마이그레이션은 profiles 테이블에 다음 컬럼을 추가합니다:
- `location` (VARCHAR)
- `skills` (TEXT[])
- `social_links` (JSONB)

---

*이 문서는 지속적으로 업데이트됩니다.*
