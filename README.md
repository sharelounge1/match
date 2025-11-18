# MatchUp - 협업 매칭 플랫폼

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Deploy-46E3B7?logo=render)](https://render.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 프로젝트 개요

**MatchUp**은 '아이디어를 가진 사람'과 '기술을 가진 사람'을 **지분/수익 공유 방식**으로 연결하는 협업 매칭 플랫폼입니다.

### Vision

AI 시대에 맞는 새로운 창업 방식—누구나 서비스 창업자가 될 수 있는 협업 생태계를 만듭니다.

### 핵심 가치 제안

| 대상 | 제공 가치 |
|------|----------|
| **운영자/마케터** | 개발 리소스를 모아 MVP/서비스를 실제로 만들 기회 |
| **개발자** | 혼자 만들고 버려지는 프로젝트를 운영·마케팅과 결합해 성장 |
| **모든 사용자** | "혼자 만드는 앱"에서 "팀으로 만드는 제품"으로 전환 |

---

## 주요 기능

### 프로젝트 매칭
- **아이디어 기반 매칭**: 운영자가 아이디어를 등록하고 개발자/디자이너를 모집
- **서비스 기반 매칭**: 개발자가 완성된 서비스를 등록하고 운영/마케팅 인력 모집

### 역할 시스템
- **4팀 구조**: 개발자(Dev), 운영자(Biz), 마케터(Growth), 디자이너(Design)
- **복수 역할 지원**: 지원자는 최대 2개 역할 선택 가능

### 조건 설정
- 지분(%) 및 수익(%) 배분 조건 설정
- 역할별 자동 배분표 생성
- 근무 형태, 예상 기간 등 상세 조건 설정

### 매칭 프로세스
1. 프로젝트 등록 (결제)
2. 지원자 검토
3. 미팅 수락 (결제)
4. 계약서 작성/전자서명
5. 협업 시작

### 계약 및 정산
- 표준 계약서 템플릿 제공
- 전자서명 기능
- PDF 자동 생성 및 보관

---

## 기술 스택

### Frontend
```
React 18+ with TypeScript
Vite (Build Tool)
Tailwind CSS + shadcn/ui
Zustand (State Management)
TanStack Query (Server State)
React Router v6
React Hook Form + Zod
```

### Backend
```
Supabase (PostgreSQL)
Supabase Auth
Supabase Storage
Supabase Edge Functions (Deno)
Supabase Realtime
```

### Infrastructure
```
Render.com (Web Hosting)
Stripe (Payment)
SendGrid (Email)
```

---

## 프로젝트 구조

```
matchup/
├── docs/                          # 프로젝트 문서
│   ├── ARCHITECTURE.md            # 기술 아키텍처
│   ├── DATABASE_SCHEMA.md         # DB 스키마
│   ├── INFORMATION_ARCHITECTURE.md # 정보구조도
│   ├── SCREEN_SPECIFICATIONS.md   # 화면명세서
│   ├── API_SPECIFICATION.md       # API 명세서
│   ├── DESIGN_SYSTEM.md           # 디자인 시스템
│   └── screenshots/               # 화면 스크린샷
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 컴포넌트
│   │   ├── common/                # 공통 컴포넌트
│   │   ├── screens/               # 페이지 컴포넌트
│   │   └── layout/                # 레이아웃
│   ├── stores/                    # Zustand 스토어
│   ├── hooks/                     # 커스텀 훅
│   ├── services/                  # API 서비스
│   ├── types/                     # TypeScript 타입
│   ├── utils/                     # 유틸리티
│   └── routes/                    # 라우팅
├── supabase/
│   ├── functions/                 # Edge Functions
│   └── migrations/                # DB 마이그레이션
└── scripts/                       # 빌드/문서 스크립트
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Supabase CLI

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/matchup.git
cd matchup

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에 Supabase 키 입력
```

### 환경 변수

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx

# App
VITE_APP_URL=http://localhost:5173
```

### 개발 서버 실행

```bash
# Supabase 로컬 시작 (선택)
supabase start

# 개발 서버 시작
npm run dev
```

---

## 개발 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run test         # 테스트 실행
npm run lint         # 린트 검사
npm run type-check   # 타입 체크
npm run format       # 코드 포맷팅
```

---

## 문서

프로젝트 문서는 `docs/` 폴더에서 확인할 수 있습니다:

- [기술 아키텍처](./docs/ARCHITECTURE.md) - 시스템 구조, 인프라, 배포
- [데이터베이스 스키마](./docs/DATABASE_SCHEMA.md) - 테이블 정의, 관계, 트리거
- [정보구조도](./docs/INFORMATION_ARCHITECTURE.md) - 사이트맵, 화면 구조
- [화면명세서](./docs/SCREEN_SPECIFICATIONS.md) - 화면별 UI/기능 상세
- [API 명세서](./docs/API_SPECIFICATION.md) - 엔드포인트, 요청/응답
- [디자인 시스템](./docs/DESIGN_SYSTEM.md) - 컬러, 타이포, 컴포넌트

---

## 배포

### Render.com 배포

```yaml
# render.yaml
services:
  - type: web
    name: matchup-web
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
```

### Supabase 배포

```bash
# 마이그레이션 적용
supabase db push

# Edge Functions 배포
supabase functions deploy
```

---

## 비즈니스 모델

### 수익 구조

| 항목 | 금액 | 설명 |
|------|------|------|
| 프로젝트 업로드 | 5,000원 | 프로젝트 등록 시 |
| 미팅 성사 수수료 | 10,000원 | 지원 수락 시 |
| 계약서 발급 | 3,000원 | 계약서 생성 시 (선택) |

### 향후 확장
- 서비스 출시 후 자동 정산 (매출 x%)
- 광고/노출 우선권 판매
- 커뮤니티 유료 멤버십

---

## 프로젝트 현황

### 개발 진행률

![Progress](https://img.shields.io/badge/진행률-기획완료-blue)

- [x] 프로젝트 기획
- [x] 기술 아키텍처 설계
- [x] DB 스키마 설계
- [x] 화면 설계
- [x] API 설계
- [x] 디자인 시스템
- [ ] 프론트엔드 개발
- [ ] 백엔드 개발
- [ ] 테스트
- [ ] 배포

### 주요 마일스톤

| Phase | 기간 | 목표 |
|-------|------|------|
| Phase 1 | 2주 | MVP 개발 (인증, 프로젝트 등록/탐색) |
| Phase 2 | 2주 | 지원/매칭 시스템 |
| Phase 3 | 2주 | 미팅/계약 기능 |
| Phase 4 | 1주 | 결제 연동 |
| Phase 5 | 1주 | 테스트 및 배포 |

---

## 기여하기

1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add AmazingFeature'`)
4. 브랜치 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 연락처

- **이메일**: contact@matchup.com
- **웹사이트**: https://matchup.com
- **GitHub**: https://github.com/your-org/matchup

---

**MatchUp** - 아이디어와 기술의 만남, 함께 성장하는 파트너십
