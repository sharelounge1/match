# MatchUp - 정보구조도 (Information Architecture)

**버전**: 1.0
**최종 수정일**: 2025-01-18

---

## 1. 개요

MatchUp 서비스의 전체 화면 구조와 네비게이션 경로를 정의합니다.

---

## 2. 전체 사이트맵

```
MatchUp
│
├── 인증 (Authentication) - /auth
│   ├── 로그인 (/) - LoginScreen
│   ├── 회원가입 (/signup) - SignUpScreen
│   │   ├── Step 1: 기본정보 입력
│   │   ├── Step 2: 역할 선택
│   │   ├── Step 3: 프로필 설정
│   │   └── Step 4: 완료
│   ├── 비밀번호 찾기 (/forgot-password) - ForgotPasswordScreen
│   ├── 비밀번호 재설정 (/reset-password) - ResetPasswordScreen
│   ├── 이메일 인증 (/verify-email) - VerifyEmailScreen
│   └── OAuth 콜백 (/callback) - OAuthCallbackScreen
│
├── 온보딩 (Onboarding) - /onboarding
│   ├── 서비스 소개 (/intro) - IntroScreen
│   ├── 역할 선택 (/role) - RoleSelectScreen
│   └── 프로필 완성 (/profile) - ProfileSetupScreen
│
├── 메인 홈 (Home) - /
│   └── 대시보드 (/) - HomeScreen
│       ├── 인기 프로젝트 섹션
│       ├── 신규 프로젝트 섹션
│       ├── 나의 진행중 프로젝트
│       └── 빠른 액션 메뉴
│
├── 프로젝트 탐색 (Explore) - /explore
│   ├── 프로젝트 목록 (/) - ExploreScreen
│   │   ├── 검색바
│   │   ├── 필터 패널
│   │   └── 프로젝트 카드 리스트
│   └── 검색 결과 (/search) - SearchResultScreen
│
├── 프로젝트 (Projects) - /projects
│   ├── 프로젝트 상세 (/:id) - ProjectDetailScreen
│   │   ├── 개요 탭
│   │   ├── 팀 구성 탭
│   │   ├── 조건 탭
│   │   └── 지원하기 CTA
│   ├── 프로젝트 등록 (/new) - ProjectCreateScreen
│   │   ├── Step 1: 프로젝트 유형 선택
│   │   ├── Step 2: 기본 정보 입력
│   │   ├── Step 3: 상세 설명
│   │   ├── Step 4: 역할/조건 설정
│   │   ├── Step 5: 미리보기
│   │   └── Step 6: 결제 및 게시
│   ├── 프로젝트 수정 (/:id/edit) - ProjectEditScreen
│   └── 프로젝트 지원 (/:id/apply) - ProjectApplyScreen
│       ├── 역할 선택
│       ├── 자기소개/어필
│       ├── 포트폴리오 선택
│       └── 조건 협상
│
├── 나의 프로젝트 (My Projects) - /my-projects
│   ├── 등록한 프로젝트 (/posted) - PostedProjectsScreen
│   │   ├── 진행중 탭
│   │   ├── 마감 탭
│   │   └── 완료 탭
│   ├── 지원한 프로젝트 (/applied) - AppliedProjectsScreen
│   │   ├── 대기중 탭
│   │   ├── 수락됨 탭
│   │   └── 거절됨 탭
│   └── 협업중인 프로젝트 (/collaborating) - CollaboratingProjectsScreen
│
├── 지원자 관리 (Applicants) - /projects/:id/applicants
│   ├── 지원자 목록 (/) - ApplicantListScreen
│   │   ├── 전체 탭
│   │   ├── 검토중 탭
│   │   ├── 후보 탭
│   │   └── 수락/거절 탭
│   └── 지원자 상세 (/:applicantId) - ApplicantDetailScreen
│       ├── 프로필 정보
│       ├── 포트폴리오
│       ├── 지원 내용
│       └── 수락/거절/미팅신청 액션
│
├── 미팅 (Meetings) - /meetings
│   ├── 미팅 목록 (/) - MeetingListScreen
│   │   ├── 예정된 미팅 탭
│   │   ├── 완료된 미팅 탭
│   │   └── 취소된 미팅 탭
│   ├── 미팅 상세 (/:id) - MeetingDetailScreen
│   │   ├── 미팅 정보
│   │   ├── 참가자 정보
│   │   ├── 아젠다
│   │   └── 미팅룸 입장
│   ├── 미팅 스케줄링 (/schedule) - MeetingScheduleScreen
│   │   ├── 날짜 선택
│   │   ├── 시간 선택
│   │   └── 미팅 방식 선택
│   └── 미팅 룸 (/:id/room) - MeetingRoomScreen
│       ├── 화상 미팅
│       ├── 텍스트 채팅
│       └── 화면 공유
│
├── 계약 (Contracts) - /contracts
│   ├── 계약 목록 (/) - ContractListScreen
│   │   ├── 진행중 탭
│   │   ├── 완료 탭
│   │   └── 만료 탭
│   ├── 계약서 상세 (/:id) - ContractDetailScreen
│   │   ├── 계약 조건
│   │   ├── 서명 상태
│   │   └── PDF 다운로드
│   ├── 계약서 생성 (/new) - ContractCreateScreen
│   │   ├── 템플릿 선택
│   │   ├── 조건 입력
│   │   └── 미리보기
│   └── 계약서 서명 (/:id/sign) - ContractSignScreen
│       ├── 조건 확인
│       ├── 전자서명
│       └── 완료 확인
│
├── 메시지 (Messages) - /messages
│   ├── 채팅 목록 (/) - MessageListScreen
│   └── 채팅방 (/:roomId) - ChatRoomScreen
│       ├── 메시지 리스트
│       ├── 메시지 입력
│       └── 파일 첨부
│
├── 알림 (Notifications) - /notifications
│   └── 알림 목록 (/) - NotificationListScreen
│       ├── 전체 탭
│       ├── 프로젝트 탭
│       ├── 미팅 탭
│       └── 계약 탭
│
├── 프로필 (Profile) - /profile
│   ├── 내 프로필 (/) - MyProfileScreen
│   │   ├── 기본 정보
│   │   ├── 역할/스킬
│   │   ├── 포트폴리오
│   │   └── 활동 통계
│   ├── 프로필 수정 (/edit) - ProfileEditScreen
│   │   ├── 기본 정보 편집
│   │   ├── 역할 변경
│   │   ├── SNS 연동
│   │   └── 인증 배지
│   ├── 포트폴리오 관리 (/portfolio) - PortfolioManageScreen
│   │   ├── 포트폴리오 목록
│   │   ├── 추가/수정/삭제
│   │   └── 순서 변경
│   ├── 포트폴리오 추가 (/portfolio/new) - PortfolioCreateScreen
│   └── 포트폴리오 수정 (/portfolio/:id/edit) - PortfolioEditScreen
│
├── 공개 프로필 (Public Profile) - /users/:id
│   └── 사용자 프로필 (/) - UserProfileScreen
│       ├── 프로필 정보
│       ├── 포트폴리오
│       ├── 리뷰/평점
│       └── 메시지 보내기
│
├── 결제 (Payments) - /payments
│   ├── 결제 내역 (/) - PaymentHistoryScreen
│   ├── 결제 상세 (/:id) - PaymentDetailScreen
│   └── 결제 진행 (/checkout) - CheckoutScreen
│       ├── 결제 정보 확인
│       ├── 결제 수단 선택
│       └── 결제 완료
│
├── 설정 (Settings) - /settings
│   ├── 설정 메인 (/) - SettingsScreen
│   ├── 계정 설정 (/account) - AccountSettingsScreen
│   │   ├── 이메일 변경
│   │   ├── 비밀번호 변경
│   │   └── 계정 삭제
│   ├── 알림 설정 (/notifications) - NotificationSettingsScreen
│   │   ├── 푸시 알림
│   │   ├── 이메일 알림
│   │   └── SMS 알림
│   ├── 개인정보 설정 (/privacy) - PrivacySettingsScreen
│   │   ├── 프로필 공개 범위
│   │   ├── 연락처 공개
│   │   └── 활동 공개
│   └── 결제 수단 관리 (/payment-methods) - PaymentMethodsScreen
│       ├── 카드 목록
│       ├── 카드 추가
│       └── 기본 카드 설정
│
├── 고객 지원 (Support) - /support
│   ├── 도움말 (/) - HelpCenterScreen
│   ├── FAQ (/faq) - FAQScreen
│   ├── 문의하기 (/contact) - ContactScreen
│   └── 이용 가이드 (/guide) - UserGuideScreen
│
└── 법적 문서 (Legal) - /legal
    ├── 이용약관 (/terms) - TermsScreen
    ├── 개인정보처리방침 (/privacy) - PrivacyPolicyScreen
    └── 환불 정책 (/refund) - RefundPolicyScreen
```

---

## 3. 사용자 역할별 주요 흐름

### 3.1. 운영자/마케터 (아이디어 보유자) Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   회원가입   │────▶│   역할선택   │────▶│  프로필설정  │
└────────────┘     └────────────┘     └────────────┘
                                            │
                                            ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│   결제완료   │◀────│  프로젝트등록 │◀────│   홈화면    │
└────────────┘     └────────────┘     └────────────┘
      │
      ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│  지원자확인  │────▶│  지원자검토  │────▶│  미팅수락   │
└────────────┘     └────────────┘     └────────────┘
                                            │
                                            ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│   협업시작   │◀────│   계약체결   │◀────│   미팅진행   │
└────────────┘     └────────────┘     └────────────┘
```

### 3.2. 개발자 Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   회원가입   │────▶│   역할선택   │────▶│ 포트폴리오등록│
└────────────┘     └────────────┘     └────────────┘
                                            │
                                            ▼
┌────────────┐                        ┌────────────┐
│ 서비스등록   │◀───────또는──────────│  프로젝트탐색 │
│(선택)       │                        │             │
└────────────┘                        └────────────┘
      │                                     │
      ▼                                     ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│  지원자대기  │     │  프로젝트지원 │────▶│  미팅대기   │
└────────────┘     └────────────┘     └────────────┘
      │                                     │
      ▼                                     ▼
┌────────────┐     ┌────────────┐     ┌────────────┐
│   협업시작   │◀────│   계약체결   │◀────│   미팅진행   │
└────────────┘     └────────────┘     └────────────┘
```

---

## 4. 주요 화면별 기능 설명

### 4.1. 인증 및 온보딩

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **LoginScreen** | `/auth` | 이메일/비밀번호 로그인, 소셜 로그인(Google, GitHub, Kakao), 비밀번호 찾기 링크 |
| **SignUpScreen** | `/auth/signup` | 이메일 회원가입, 소셜 회원가입, 이용약관 동의, 마케팅 수신 동의 |
| **ForgotPasswordScreen** | `/auth/forgot-password` | 이메일 입력, 비밀번호 재설정 링크 발송 |
| **VerifyEmailScreen** | `/auth/verify-email` | 이메일 인증 완료 안내, 인증 메일 재발송 |
| **RoleSelectScreen** | `/onboarding/role` | 역할 선택(Dev/Biz/Marketing/Design), 복수 선택 가능, 주 역할 지정 |
| **ProfileSetupScreen** | `/onboarding/profile` | 기본 정보 입력, GitHub/LinkedIn 연동, 프로필 사진 업로드 |

### 4.2. 메인 홈 및 탐색

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **HomeScreen** | `/` | 인기 프로젝트 캐러셀, 신규 프로젝트 리스트, 내 진행중 프로젝트, 빠른 액션(프로젝트 등록, 탐색) |
| **ExploreScreen** | `/explore` | 프로젝트 검색, 필터링(역할, 분야, 지분조건, 상태), 정렬(최신순, 인기순, 마감임박순) |
| **SearchResultScreen** | `/explore/search` | 검색 결과 리스트, 필터 재설정, 검색어 하이라이트 |

### 4.3. 프로젝트 관리

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **ProjectDetailScreen** | `/projects/:id` | 프로젝트 상세 정보, 게시자 프로필, 팀 구성 현황, 지분/수익 조건, 지원하기 버튼, 북마크 |
| **ProjectCreateScreen** | `/projects/new` | 프로젝트 유형 선택, 정보 입력(제목, 설명, 문제/솔루션), 역할 모집, 조건 설정, 결제 |
| **ProjectEditScreen** | `/projects/:id/edit` | 프로젝트 정보 수정, 모집 역할 변경, 마감일 연장 |
| **ProjectApplyScreen** | `/projects/:id/apply` | 지원 역할 선택(최대 2개), 자기소개 작성, 포트폴리오 첨부, 조건 협상 |
| **PostedProjectsScreen** | `/my-projects/posted` | 내가 등록한 프로젝트 목록, 상태별 탭, 지원자 수 표시 |
| **AppliedProjectsScreen** | `/my-projects/applied` | 지원한 프로젝트 목록, 상태별 탭(대기/수락/거절) |
| **CollaboratingProjectsScreen** | `/my-projects/collaborating` | 현재 협업중인 프로젝트, 팀원 목록, 계약서 링크 |

### 4.4. 지원자 관리

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **ApplicantListScreen** | `/projects/:id/applicants` | 지원자 카드 리스트, 상태별 필터, 역할별 필터, 정렬 |
| **ApplicantDetailScreen** | `/projects/:id/applicants/:applicantId` | 지원자 프로필, 포트폴리오, 지원 내용, 요청 조건, 수락/거절/미팅신청 버튼 |

### 4.5. 미팅

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **MeetingListScreen** | `/meetings` | 미팅 목록, 날짜별 그룹핑, 상태 표시, 캘린더 뷰 토글 |
| **MeetingDetailScreen** | `/meetings/:id` | 미팅 정보, 참가자 정보, 아젠다, 미팅룸 입장 버튼, 일정 변경 요청 |
| **MeetingScheduleScreen** | `/meetings/schedule` | 캘린더 날짜 선택, 시간대 선택, 미팅 방식(화상/전화/채팅), 메모 입력 |
| **MeetingRoomScreen** | `/meetings/:id/room` | 화상 통화(WebRTC), 텍스트 채팅, 화면 공유, 미팅 종료 |

### 4.6. 계약

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **ContractListScreen** | `/contracts` | 계약서 목록, 상태별 필터, 서명 대기 알림 |
| **ContractDetailScreen** | `/contracts/:id` | 계약 조건 상세, 양측 서명 상태, PDF 다운로드, 계약 이력 |
| **ContractCreateScreen** | `/contracts/new` | 계약 유형 선택, 템플릿 선택, 조건 커스터마이징, 미리보기 |
| **ContractSignScreen** | `/contracts/:id/sign` | 조건 최종 확인, 전자서명 입력, 서명 완료 확인 |

### 4.7. 메시지 및 알림

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **MessageListScreen** | `/messages` | 채팅방 목록, 최근 메시지 미리보기, 읽지 않은 메시지 표시 |
| **ChatRoomScreen** | `/messages/:roomId` | 실시간 메시지, 파일/이미지 첨부, 읽음 확인, 상대방 프로필 |
| **NotificationListScreen** | `/notifications` | 알림 목록, 유형별 필터, 전체 읽음 처리, 알림 클릭 시 해당 화면 이동 |

### 4.8. 프로필

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **MyProfileScreen** | `/profile` | 내 프로필 표시, 편집 버튼, 통계(완료 프로젝트, 수익, 평점), 포트폴리오 미리보기 |
| **ProfileEditScreen** | `/profile/edit` | 기본 정보 수정, 역할 변경, SNS 연동, GitHub 인증, 프로필 사진 변경 |
| **PortfolioManageScreen** | `/profile/portfolio` | 포트폴리오 목록, 드래그&드롭 순서 변경, 추가/수정/삭제 |
| **PortfolioCreateScreen** | `/profile/portfolio/new` | 포트폴리오 추가, 제목/설명/링크/이미지, 기술 스택 태그 |
| **UserProfileScreen** | `/users/:id` | 다른 사용자 프로필, 포트폴리오, 리뷰/평점, 메시지 보내기 버튼 |

### 4.9. 결제 및 설정

| 화면 | 컴포넌트 | 주요 기능 |
|------|----------|----------|
| **PaymentHistoryScreen** | `/payments` | 결제 내역 리스트, 유형별 필터, 기간별 필터 |
| **PaymentDetailScreen** | `/payments/:id` | 결제 상세, 영수증, 환불 요청 |
| **CheckoutScreen** | `/payments/checkout` | 결제 금액 확인, 카드 선택/입력, 결제 진행, 완료 확인 |
| **SettingsScreen** | `/settings` | 설정 메뉴 리스트(계정, 알림, 개인정보, 결제수단) |
| **AccountSettingsScreen** | `/settings/account` | 이메일 변경, 비밀번호 변경, 소셜 연동 관리, 계정 삭제 |
| **NotificationSettingsScreen** | `/settings/notifications` | 알림 유형별 on/off, 푸시/이메일/SMS 설정 |
| **PrivacySettingsScreen** | `/settings/privacy` | 프로필 공개 범위, 연락처 공개, 활동 내역 공개 |
| **PaymentMethodsScreen** | `/settings/payment-methods` | 등록된 카드 목록, 카드 추가/삭제, 기본 카드 설정 |

---

## 5. 팝업 및 모달 정의

### 5.1. 확인/안내 팝업

| 팝업명 | 표시 상황 | 내용 |
|--------|----------|------|
| **ConfirmApplyModal** | 프로젝트 지원 시 | "지원하시겠습니까?" 확인, 지원 역할 요약 |
| **ConfirmAcceptModal** | 지원 수락 시 | "수락하시겠습니까?" 결제 안내, 금액 표시 |
| **ConfirmRejectModal** | 지원 거절 시 | "거절하시겠습니까?" 거절 사유 입력(선택) |
| **ConfirmWithdrawModal** | 지원 취소 시 | "지원을 취소하시겠습니까?" |
| **ConfirmCancelMeetingModal** | 미팅 취소 시 | "미팅을 취소하시겠습니까?" 취소 사유 입력 |
| **ConfirmSignModal** | 계약 서명 시 | "계약에 서명하시겠습니까?" 최종 조건 확인 |
| **ConfirmDeleteModal** | 삭제 작업 시 | "정말 삭제하시겠습니까?" 되돌릴 수 없음 안내 |
| **ConfirmLogoutModal** | 로그아웃 시 | "로그아웃 하시겠습니까?" |

### 5.2. 입력 팝업

| 팝업명 | 표시 상황 | 입력 항목 |
|--------|----------|----------|
| **ReportUserModal** | 사용자 신고 시 | 신고 유형, 상세 내용 |
| **ScheduleMeetingModal** | 미팅 일정 잡기 | 날짜, 시간, 미팅 방식, 메모 |
| **NegotiateConditionModal** | 조건 협상 시 | 희망 지분%, 희망 수익%, 메시지 |
| **AddReviewModal** | 리뷰 작성 시 | 별점, 카테고리별 평점, 코멘트 |
| **ChangeEmailModal** | 이메일 변경 시 | 새 이메일, 비밀번호 확인 |
| **ChangePasswordModal** | 비밀번호 변경 시 | 현재 비밀번호, 새 비밀번호, 확인 |

### 5.3. 정보 표시 팝업

| 팝업명 | 표시 상황 | 내용 |
|--------|----------|------|
| **PaymentSuccessModal** | 결제 완료 시 | 결제 완료 안내, 금액, 다음 단계 안내 |
| **PaymentFailedModal** | 결제 실패 시 | 실패 사유, 재시도 버튼, 고객센터 연결 |
| **ApplicationSuccessModal** | 지원 완료 시 | 지원 완료 안내, 예상 검토 기간 |
| **ContractSignedModal** | 계약 완료 시 | 계약 완료 축하, PDF 다운로드, 다음 단계 안내 |
| **MeetingReminderModal** | 미팅 10분 전 | 미팅 알림, 참가자, 미팅룸 입장 버튼 |
| **NewNotificationModal** | 중요 알림 수신 시 | 알림 내용 요약, 바로가기 |
| **UploadGuideModal** | 프로젝트 등록 첫 진입 | 등록 절차 안내, 결제 정보 |
| **ApplicantGuideModal** | 지원하기 첫 진입 | 지원 절차 안내, 성공적인 지원 팁 |

### 5.4. 액션 시트 (Bottom Sheet)

| 시트명 | 표시 상황 | 액션 항목 |
|--------|----------|----------|
| **ProjectActionSheet** | 프로젝트 카드 더보기 | 상세보기, 북마크, 공유, 신고 |
| **ApplicantActionSheet** | 지원자 카드 더보기 | 프로필 보기, 미팅 신청, 수락, 거절 |
| **MessageActionSheet** | 메시지 롱프레스 | 복사, 삭제, 신고 |
| **ImageActionSheet** | 프로필 이미지 클릭 | 앨범에서 선택, 카메라 촬영, 삭제 |
| **SortFilterSheet** | 정렬/필터 버튼 클릭 | 정렬 옵션, 필터 옵션 |

---

## 6. 라우팅 설정

### 6.1. 공개 라우트 (인증 불필요)

```typescript
const publicRoutes = [
  '/auth',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/callback',
  '/legal/terms',
  '/legal/privacy',
  '/legal/refund',
];
```

### 6.2. 보호 라우트 (인증 필요)

```typescript
const protectedRoutes = [
  '/',
  '/explore',
  '/projects/*',
  '/my-projects/*',
  '/meetings/*',
  '/contracts/*',
  '/messages/*',
  '/notifications',
  '/profile/*',
  '/payments/*',
  '/settings/*',
];
```

### 6.3. 온보딩 라우트 (프로필 미완성 시)

```typescript
const onboardingRoutes = [
  '/onboarding/intro',
  '/onboarding/role',
  '/onboarding/profile',
];
```

---

## 7. 네비게이션 구조

### 7.1. 헤더 네비게이션

```
┌─────────────────────────────────────────────────┐
│  [Logo]    [탐색] [나의 프로젝트]    [🔔] [👤]  │
└─────────────────────────────────────────────────┘
```

### 7.2. 모바일 하단 네비게이션

```
┌─────────────────────────────────────────────────┐
│   [홈]    [탐색]   [+등록]   [미팅]   [메시지]   │
└─────────────────────────────────────────────────┘
```

### 7.3. 사이드바 메뉴 (데스크톱)

```
대시보드
프로젝트 탐색
━━━━━━━━━━
나의 프로젝트
 ├─ 등록한 프로젝트
 ├─ 지원한 프로젝트
 └─ 협업중인 프로젝트
미팅
계약
━━━━━━━━━━
메시지
알림
━━━━━━━━━━
프로필
설정
도움말
```

---

## 8. 딥링크 구조

### 8.1. 앱 딥링크

```
matchup://project/[id]           → 프로젝트 상세
matchup://meeting/[id]           → 미팅 상세
matchup://contract/[id]          → 계약서 상세
matchup://user/[id]              → 사용자 프로필
matchup://notification/[id]      → 알림 상세
```

### 8.2. 웹 URL 구조

```
https://matchup.app/projects/[id]
https://matchup.app/users/[id]
https://matchup.app/invite/[code]
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
