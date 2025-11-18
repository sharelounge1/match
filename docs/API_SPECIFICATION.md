# MatchUp - API 명세서 (API Specification)

**버전**: 1.0
**최종 수정일**: 2025-01-18
**Base URL**: `https://[project-ref].supabase.co`

---

## 1. 개요

### 1.1. API 아키텍처

MatchUp API는 두 가지 유형으로 구성됩니다:

1. **Supabase Auto-generated API**: PostgreSQL 테이블 기반 자동 생성 REST API
2. **Edge Functions**: 복잡한 비즈니스 로직을 위한 서버리스 함수

### 1.2. 인증

모든 API 요청은 Supabase Auth JWT 토큰을 사용합니다.

```http
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

### 1.3. 공통 응답 형식

**성공 응답**
```json
{
  "data": { /* 실제 데이터 */ },
  "error": null
}
```

**에러 응답**
```json
{
  "data": null,
  "error": {
    "message": "에러 메시지",
    "details": "상세 정보",
    "hint": "해결 힌트",
    "code": "에러 코드"
  }
}
```

---

## 2. 인증 API (Supabase Auth)

### 2.1. 회원가입

**Endpoint**: `POST /auth/v1/signup`

**Request**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "data": {
    "name": "홍길동"
  }
}
```

**Response (성공)**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2025-01-18T10:00:00Z"
    },
    "session": null
  },
  "error": null
}
```

---

### 2.2. 로그인

**Endpoint**: `POST /auth/v1/token?grant_type=password`

**Request**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (성공)**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "name": "홍길동"
      }
    }
  },
  "error": null
}
```

---

### 2.3. OAuth 로그인

**Endpoint**: `GET /auth/v1/authorize`

**Query Parameters**
| Parameter | Required | Description |
|-----------|----------|-------------|
| provider | Yes | `google`, `github`, `kakao` |
| redirect_to | Yes | 콜백 URL |

**Example**
```
/auth/v1/authorize?provider=google&redirect_to=https://app.matchup.com/auth/callback
```

---

### 2.4. 토큰 갱신

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

**Request**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

---

### 2.5. 비밀번호 재설정 요청

**Endpoint**: `POST /auth/v1/recover`

**Request**
```json
{
  "email": "user@example.com"
}
```

---

### 2.6. 로그아웃

**Endpoint**: `POST /auth/v1/logout`

**Headers**
```http
Authorization: Bearer <access_token>
```

---

## 3. 프로필 API

### 3.1. 내 프로필 조회

**Endpoint**: `GET /rest/v1/profiles`

**Query Parameters**
```
?select=*&id=eq.<user_id>
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "roles": ["dev", "biz"],
      "primary_role": "dev",
      "bio": "풀스택 개발자입니다",
      "company": "ABC 스타트업",
      "position": "CTO",
      "experience_years": 7,
      "avatar_url": "https://...",
      "github_username": "honggildong",
      "github_verified": true,
      "rating": 4.8,
      "review_count": 12,
      "projects_completed": 5,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "error": null
}
```

---

### 3.2. 프로필 수정

**Endpoint**: `PATCH /rest/v1/profiles`

**Query Parameters**
```
?id=eq.<user_id>
```

**Request**
```json
{
  "name": "홍길동",
  "bio": "업데이트된 소개",
  "roles": ["dev", "biz", "marketing"],
  "primary_role": "dev",
  "company": "XYZ 스타트업",
  "position": "CEO",
  "experience_years": 8
}
```

---

### 3.3. 다른 사용자 프로필 조회

**Endpoint**: `GET /rest/v1/profiles`

**Query Parameters**
```
?select=id,name,avatar_url,roles,primary_role,bio,rating,review_count,experience_years
&id=eq.<user_id>
```

---

## 4. 포트폴리오 API

### 4.1. 포트폴리오 목록 조회

**Endpoint**: `GET /rest/v1/portfolios`

**Query Parameters**
```
?select=*&user_id=eq.<user_id>&order=display_order.asc
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "AI 추천 시스템",
      "description": "개인화 추천 알고리즘 개발",
      "url": "https://github.com/...",
      "image_urls": ["https://..."],
      "tech_stack": ["Python", "TensorFlow", "FastAPI"],
      "category": "project",
      "is_public": true,
      "display_order": 1
    }
  ],
  "error": null
}
```

---

### 4.2. 포트폴리오 추가

**Endpoint**: `POST /rest/v1/portfolios`

**Request**
```json
{
  "user_id": "uuid",
  "title": "새 프로젝트",
  "description": "프로젝트 설명",
  "url": "https://...",
  "image_urls": ["https://..."],
  "tech_stack": ["React", "Node.js"],
  "category": "project",
  "is_public": true
}
```

---

### 4.3. 포트폴리오 수정

**Endpoint**: `PATCH /rest/v1/portfolios`

**Query Parameters**
```
?id=eq.<portfolio_id>
```

---

### 4.4. 포트폴리오 삭제

**Endpoint**: `DELETE /rest/v1/portfolios`

**Query Parameters**
```
?id=eq.<portfolio_id>
```

---

## 5. 프로젝트 API

### 5.1. 프로젝트 목록 조회

**Endpoint**: `GET /rest/v1/projects`

**Query Parameters**
```
?select=*,profiles!owner_id(name,avatar_url,rating)
&status=eq.active
&order=created_at.desc
&limit=20
&offset=0
```

**필터링 예시**
```
# 역할별 필터
&roles_needed=cs.["dev"]

# 분야별 필터
&category=eq.app

# 지분 조건 필터
&equity_distribution->dev=gte.30
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "title": "AI 기반 운동 추천 서비스",
      "short_description": "개인 맞춤형 운동 추천",
      "project_type": "idea",
      "category": "app",
      "stage": "idea",
      "roles_needed": ["dev", "design"],
      "equity_distribution": {"biz": 40, "dev": 40, "design": 20},
      "revenue_distribution": {"biz": 30, "dev": 50, "design": 20},
      "status": "active",
      "deadline": "2025-01-25T23:59:59Z",
      "view_count": 324,
      "application_count": 12,
      "created_at": "2025-01-10T10:00:00Z",
      "profiles": {
        "name": "김철수",
        "avatar_url": "https://...",
        "rating": 4.8
      }
    }
  ],
  "error": null
}
```

---

### 5.2. 프로젝트 상세 조회

**Endpoint**: `GET /rest/v1/projects`

**Query Parameters**
```
?select=*,
  profiles!owner_id(id,name,avatar_url,roles,rating,review_count,bio),
  applications(id,applicant_id,applied_roles,status)
&id=eq.<project_id>
```

---

### 5.3. 프로젝트 등록 (Edge Function)

**Endpoint**: `POST /functions/v1/create-project`

**Request**
```json
{
  "title": "AI 기반 운동 추천 서비스",
  "short_description": "개인 맞춤형 운동 추천 앱",
  "description": "상세 설명...",
  "project_type": "idea",
  "category": "app",
  "stage": "idea",
  "problem_statement": "운동 방법을 모르는 사람들",
  "solution": "AI가 맞춤 추천",
  "target_customer": "20-30대 직장인",
  "roles_needed": ["dev", "design"],
  "equity_distribution": {"biz": 40, "dev": 40, "design": 20},
  "revenue_distribution": {"biz": 30, "dev": 50, "design": 20},
  "work_type": "remote",
  "work_hours": "주 20시간",
  "expected_duration": "6개월",
  "deadline": "2025-01-25T23:59:59Z",
  "payment_method_id": "pm_xxx"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "title": "AI 기반 운동 추천 서비스"
    },
    "payment": {
      "id": "uuid",
      "amount": 5000,
      "status": "completed"
    }
  }
}
```

---

### 5.4. 프로젝트 수정

**Endpoint**: `PATCH /rest/v1/projects`

**Query Parameters**
```
?id=eq.<project_id>
```

---

### 5.5. 프로젝트 삭제/마감

**Endpoint**: `PATCH /rest/v1/projects`

**Query Parameters**
```
?id=eq.<project_id>
```

**Request**
```json
{
  "status": "closed",
  "closed_at": "2025-01-18T10:00:00Z"
}
```

---

## 6. 지원 API

### 6.1. 프로젝트 지원

**Endpoint**: `POST /rest/v1/applications`

**Request**
```json
{
  "project_id": "uuid",
  "applicant_id": "uuid",
  "applied_roles": ["dev"],
  "cover_letter": "자기소개 내용...",
  "appeal_points": "강점 어필...",
  "expected_contribution": "기여할 수 있는 부분...",
  "requested_equity": 45,
  "requested_revenue_share": 55,
  "portfolio_ids": ["uuid1", "uuid2"]
}
```

---

### 6.2. 내 지원 목록 조회

**Endpoint**: `GET /rest/v1/applications`

**Query Parameters**
```
?select=*,projects(id,title,owner_id,status,deadline)
&applicant_id=eq.<user_id>
&order=created_at.desc
```

---

### 6.3. 프로젝트별 지원자 목록 조회

**Endpoint**: `GET /rest/v1/applications`

**Query Parameters**
```
?select=*,
  profiles!applicant_id(id,name,avatar_url,roles,rating,review_count,experience_years,github_username)
&project_id=eq.<project_id>
&order=created_at.desc
```

---

### 6.4. 지원 수락 (Edge Function)

**Endpoint**: `POST /functions/v1/accept-application`

**Request**
```json
{
  "application_id": "uuid",
  "payment_method_id": "pm_xxx"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "uuid",
      "status": "accepted"
    },
    "payment": {
      "id": "uuid",
      "amount": 10000,
      "status": "completed"
    },
    "meeting": {
      "id": "uuid",
      "status": "pending"
    }
  }
}
```

---

### 6.5. 지원 거절

**Endpoint**: `PATCH /rest/v1/applications`

**Query Parameters**
```
?id=eq.<application_id>
```

**Request**
```json
{
  "status": "rejected",
  "rejection_reason": "현재 모집 역할과 맞지 않습니다",
  "decided_at": "2025-01-18T10:00:00Z"
}
```

---

### 6.6. 지원 취소

**Endpoint**: `PATCH /rest/v1/applications`

**Query Parameters**
```
?id=eq.<application_id>
```

**Request**
```json
{
  "status": "withdrawn"
}
```

---

## 7. 미팅 API

### 7.1. 미팅 생성 (Edge Function)

**Endpoint**: `POST /functions/v1/create-meeting`

**Request**
```json
{
  "project_id": "uuid",
  "application_id": "uuid",
  "attendee_id": "uuid",
  "scheduled_at": "2025-01-20T14:00:00+09:00",
  "duration_minutes": 30,
  "meeting_type": "video",
  "agenda": "프로젝트 소개 및 역할 논의"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "meeting": {
      "id": "uuid",
      "scheduled_at": "2025-01-20T14:00:00+09:00",
      "meeting_url": "https://meet.matchup.com/xxx",
      "status": "scheduled"
    }
  }
}
```

---

### 7.2. 내 미팅 목록 조회

**Endpoint**: `GET /rest/v1/meetings`

**Query Parameters**
```
?select=*,
  projects(id,title),
  profiles!scheduler_id(name,avatar_url),
  profiles!attendee_id(name,avatar_url)
&or=(scheduler_id.eq.<user_id>,attendee_id.eq.<user_id>)
&order=scheduled_at.asc
```

---

### 7.3. 미팅 상태 업데이트

**Endpoint**: `PATCH /rest/v1/meetings`

**Query Parameters**
```
?id=eq.<meeting_id>
```

**Request (확정)**
```json
{
  "status": "confirmed",
  "confirmed_at": "2025-01-18T10:00:00Z"
}
```

**Request (완료)**
```json
{
  "status": "completed",
  "completed_at": "2025-01-20T14:30:00Z",
  "meeting_summary": "미팅 요약 내용..."
}
```

---

### 7.4. 미팅 취소

**Endpoint**: `PATCH /rest/v1/meetings`

**Query Parameters**
```
?id=eq.<meeting_id>
```

**Request**
```json
{
  "status": "cancelled",
  "cancelled_at": "2025-01-19T10:00:00Z"
}
```

---

## 8. 계약 API

### 8.1. 계약서 생성 (Edge Function)

**Endpoint**: `POST /functions/v1/generate-contract`

**Request**
```json
{
  "project_id": "uuid",
  "meeting_id": "uuid",
  "party2_id": "uuid",
  "contract_type": "collaboration",
  "terms": {
    "equity": {
      "party1": 40,
      "party2": 60
    },
    "revenue": {
      "party1": 30,
      "party2": 70
    },
    "roles": {
      "party1": ["biz", "marketing"],
      "party2": ["dev"]
    },
    "responsibilities": {
      "party1": ["사업 운영", "마케팅"],
      "party2": ["개발", "유지보수"]
    },
    "ip_ownership": "공동 소유",
    "effective_date": "2025-01-20",
    "expiry_date": "2025-07-20"
  },
  "payment_method_id": "pm_xxx"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "contract": {
      "id": "uuid",
      "status": "pending_signatures"
    },
    "payment": {
      "id": "uuid",
      "amount": 3000,
      "status": "completed"
    }
  }
}
```

---

### 8.2. 내 계약 목록 조회

**Endpoint**: `GET /rest/v1/contracts`

**Query Parameters**
```
?select=*,
  projects(id,title),
  profiles!party1_id(name,avatar_url),
  profiles!party2_id(name,avatar_url)
&or=(party1_id.eq.<user_id>,party2_id.eq.<user_id>)
&order=created_at.desc
```

---

### 8.3. 계약서 서명 (Edge Function)

**Endpoint**: `POST /functions/v1/sign-contract`

**Request**
```json
{
  "contract_id": "uuid",
  "signature": "data:image/png;base64,..."
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "contract": {
      "id": "uuid",
      "status": "active",
      "signed_at": "2025-01-20T10:00:00Z"
    },
    "pdf_url": "https://storage.supabase.co/..."
  }
}
```

---

### 8.4. 계약서 PDF 다운로드

**Endpoint**: `GET /functions/v1/download-contract`

**Query Parameters**
```
?contract_id=<uuid>
```

**Response**
PDF 파일 binary

---

## 9. 메시지 API

### 9.1. 채팅방 목록 조회

**Endpoint**: `GET /rest/v1/chat_rooms`

**Query Parameters**
```
?select=*,messages(content,created_at)
&participant_ids=cs.["<user_id>"]
&order=last_message_at.desc
```

---

### 9.2. 채팅방 생성

**Endpoint**: `POST /rest/v1/chat_rooms`

**Request**
```json
{
  "participant_ids": ["uuid1", "uuid2"],
  "project_id": "uuid",
  "room_type": "direct"
}
```

---

### 9.3. 메시지 목록 조회

**Endpoint**: `GET /rest/v1/messages`

**Query Parameters**
```
?select=*,profiles!sender_id(name,avatar_url)
&room_id=eq.<room_id>
&order=created_at.asc
&limit=50
```

---

### 9.4. 메시지 전송

**Endpoint**: `POST /rest/v1/messages`

**Request**
```json
{
  "room_id": "uuid",
  "sender_id": "uuid",
  "content": "안녕하세요!",
  "message_type": "text"
}
```

---

### 9.5. 실시간 메시지 구독

**JavaScript (Supabase Client)**
```javascript
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `room_id=eq.${roomId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

---

## 10. 알림 API

### 10.1. 알림 목록 조회

**Endpoint**: `GET /rest/v1/notifications`

**Query Parameters**
```
?select=*
&user_id=eq.<user_id>
&order=created_at.desc
&limit=50
```

---

### 10.2. 알림 읽음 처리

**Endpoint**: `PATCH /rest/v1/notifications`

**Query Parameters**
```
?id=eq.<notification_id>
```

**Request**
```json
{
  "is_read": true,
  "read_at": "2025-01-18T10:00:00Z"
}
```

---

### 10.3. 전체 알림 읽음 처리

**Endpoint**: `PATCH /rest/v1/notifications`

**Query Parameters**
```
?user_id=eq.<user_id>&is_read=eq.false
```

**Request**
```json
{
  "is_read": true,
  "read_at": "2025-01-18T10:00:00Z"
}
```

---

### 10.4. 실시간 알림 구독

**JavaScript (Supabase Client)**
```javascript
const subscription = supabase
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
      showToast(payload.new.content);
    }
  )
  .subscribe();
```

---

## 11. 결제 API

### 11.1. 결제 내역 조회

**Endpoint**: `GET /rest/v1/payments`

**Query Parameters**
```
?select=*,projects(title)
&user_id=eq.<user_id>
&order=created_at.desc
```

---

### 11.2. 결제 생성 (Edge Function)

**Endpoint**: `POST /functions/v1/create-payment`

**Request**
```json
{
  "payment_type": "project_upload",
  "amount": 5000,
  "project_id": "uuid",
  "payment_method_id": "pm_xxx"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "payment_intent_id": "pi_xxx",
    "client_secret": "pi_xxx_secret_xxx",
    "status": "requires_confirmation"
  }
}
```

---

### 11.3. Stripe Webhook

**Endpoint**: `POST /functions/v1/stripe-webhook`

**Headers**
```http
stripe-signature: t=xxx,v1=xxx
```

**처리되는 이벤트**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

### 11.4. 환불 요청 (Edge Function)

**Endpoint**: `POST /functions/v1/refund`

**Request**
```json
{
  "payment_id": "uuid",
  "reason": "환불 사유"
}
```

---

## 12. 리뷰 API

### 12.1. 사용자 리뷰 목록 조회

**Endpoint**: `GET /rest/v1/reviews`

**Query Parameters**
```
?select=*,profiles!reviewer_id(name,avatar_url),projects(title)
&reviewee_id=eq.<user_id>
&is_public=eq.true
&order=created_at.desc
```

---

### 12.2. 리뷰 작성

**Endpoint**: `POST /rest/v1/reviews`

**Request**
```json
{
  "reviewer_id": "uuid",
  "reviewee_id": "uuid",
  "project_id": "uuid",
  "contract_id": "uuid",
  "overall_rating": 4.5,
  "communication_rating": 5,
  "expertise_rating": 4,
  "reliability_rating": 4.5,
  "comment": "매우 협조적이고 전문적이었습니다.",
  "pros": "커뮤니케이션이 원활함",
  "cons": "일정 관리가 조금 아쉬움"
}
```

---

## 13. 북마크 API

### 13.1. 북마크 목록 조회

**Endpoint**: `GET /rest/v1/bookmarks`

**Query Parameters**
```
?select=*,projects(*)
&user_id=eq.<user_id>
&order=created_at.desc
```

---

### 13.2. 북마크 추가

**Endpoint**: `POST /rest/v1/bookmarks`

**Request**
```json
{
  "user_id": "uuid",
  "project_id": "uuid"
}
```

---

### 13.3. 북마크 삭제

**Endpoint**: `DELETE /rest/v1/bookmarks`

**Query Parameters**
```
?user_id=eq.<user_id>&project_id=eq.<project_id>
```

---

## 14. 파일 업로드 (Storage)

### 14.1. 프로필 이미지 업로드

**Endpoint**: `POST /storage/v1/object/avatars/<user_id>/profile.jpg`

**Headers**
```http
Content-Type: image/jpeg
```

**Body**: Binary image data

**Response**
```json
{
  "Key": "avatars/<user_id>/profile.jpg"
}
```

---

### 14.2. 프로젝트 이미지 업로드

**Endpoint**: `POST /storage/v1/object/projects/<project_id>/image.jpg`

---

### 14.3. 포트폴리오 파일 업로드

**Endpoint**: `POST /storage/v1/object/portfolios/<user_id>/<file_name>`

---

### 14.4. 공개 URL 생성

**Endpoint**: `POST /storage/v1/object/public/<bucket>/<path>`

**또는 직접 접근**
```
https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

---

## 15. 에러 코드

### 15.1. HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복) |
| 422 | 유효성 검사 실패 |
| 429 | 요청 한도 초과 |
| 500 | 서버 오류 |

### 15.2. Supabase 에러 코드

| 코드 | 설명 |
|------|------|
| PGRST116 | 조건에 맞는 행 없음 |
| 23505 | 유니크 제약 위반 |
| 23503 | 외래키 제약 위반 |
| 42501 | RLS 정책 위반 |
| 22P02 | 잘못된 데이터 타입 |

### 15.3. 커스텀 에러 코드 (Edge Functions)

| 코드 | 설명 |
|------|------|
| AUTH_INVALID_TOKEN | 유효하지 않은 토큰 |
| AUTH_TOKEN_EXPIRED | 만료된 토큰 |
| PROJECT_NOT_FOUND | 프로젝트 없음 |
| PROJECT_CLOSED | 마감된 프로젝트 |
| APPLICATION_DUPLICATE | 중복 지원 |
| PAYMENT_FAILED | 결제 실패 |
| PAYMENT_INSUFFICIENT | 잔액 부족 |
| CONTRACT_ALREADY_SIGNED | 이미 서명됨 |
| MEETING_CONFLICT | 미팅 시간 충돌 |

---

## 16. Rate Limiting

### 16.1. 기본 제한

| 티어 | 제한 |
|------|------|
| Anonymous | 100 req/hour |
| Authenticated | 1000 req/hour |
| Pro | 10000 req/hour |

### 16.2. 응답 헤더

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1642531200
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
