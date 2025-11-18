# CLAUDE.md - 프로젝트 개발 규칙 및 산출물 생성 템플릿

> 이 파일을 새 프로젝트의 CLAUDE.md로 복사하여 사용하세요.
> 각 섹션의 [대괄호] 부분을 프로젝트에 맞게 수정하세요.

## 사용 방법

1. 이 파일을 새 프로젝트 루트에 `CLAUDE.md`로 복사
2. **Part 1: 프로젝트 규칙**의 [대괄호] 부분을 프로젝트에 맞게 수정
3. **Part 2: 산출물 생성 가이드**는 그대로 유지 (모든 프로젝트 공통)
4. 개발 진행하면서 지속적으로 업데이트

---

# Part 1: 프로젝트 규칙 (프로젝트별 커스터마이징 필요)

## 프로젝트 개요
- **프로젝트명**: [프로젝트명]
- **목적**: [프로젝트의 목적과 해결하려는 문제]
- **기술스택**: [주요 기술 스택 나열]
- **포트**: [개발 서버 포트]

## 핵심 개발 철학

### 1. [프로젝트 핵심 원칙명] 우선 원칙
- **[핵심 가치 1]**: [구체적인 기준 및 목표]
- **[핵심 가치 2]**: [구체적인 기준 및 목표]
- **[핵심 가치 3]**: [구체적인 기준 및 목표]

### 2. FE/BE 책임 범위
```
✅ FE 담당:
- [FE가 담당할 영역들을 명시]

❌ BE 담당 (FE에서 구현 금지):
- [BE가 담당할 영역들을 명시]
```

## 기술 스택 & 구조

### 필수 기술 스택
```
Runtime: [프레임워크 + 버전]
State: [상태관리 라이브러리]
Style: [스타일링 라이브러리]
Router: [라우팅 라이브러리]
Storage: [로컬 스토리지 전략]
```

### 프로젝트 구조
```
src/
├── components/
│   ├── ui/
│   ├── common/
│   ├── screens/
│   └── layout/
├── stores/
├── hooks/
├── services/
├── types/
├── utils/
├── mocks/
└── assets/
```

## 코딩 컨벤션

### 1. 명명 규칙
```typescript
// 컴포넌트: PascalCase
const LoginScreen = () => { };
const MyComponent = () => { };

// 변수/함수: camelCase
const userName = 'john';
const handleClick = () => { };

// 이벤트 핸들러: on[Action] 형태
const onLogin = () => { };
const onSubmit = () => { };

// 상수: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// 파일명:
// - 컴포넌트: PascalCase.tsx (LoginScreen.tsx)
// - 훅: camelCase.ts (useAuth.ts)
// - 기타: camelCase.ts (apiClient.ts)
```

### 2. 컴포넌트 작성 규칙
```typescript
// ✅ 반드시 이 구조 준수
import { useState, useEffect, useMemo, useCallback } from 'react';

interface ComponentProps {
  // Props 타입 명시적 정의 (필수)
}

export const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  // 1. State 변수들
  const [state, setState] = useState();

  // 2. 커스텀 훅들
  const { data } = useQuery();

  // 3. 계산된 값들 (useMemo)
  const computedValue = useMemo(() => { }, [deps]);

  // 4. 이벤트 핸들러들 (useCallback)
  const handleEvent = useCallback(() => { }, [deps]);

  // 5. 사이드 이펙트들 (useEffect)
  useEffect(() => { }, []);

  // 6. 렌더링
  return <div>{/* JSX */}</div>;
};
```

### 3. 스타일링 규칙
```typescript
// ✅ [스타일링 라이브러리] 사용
import { Button } from '@/components/ui/button';

// ✅ 프로젝트 전용 색상 정의
const colors = {
  'primary': '[Primary Color]',
  'success': '[Success Color]',
  'warning': '[Warning Color]',
  'error': '[Error Color]',
};
```

## 프로젝트별 특화 규칙

### 1. [핵심 기능/도메인 규칙]
```typescript
// [프로젝트 특화 기능 구현 규칙 작성]
// [예: 실시간 데이터 처리, 파일 업로드, 결제 처리 등]
```

## API 통신 규칙

```typescript
// ✅ 타입 우선 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ✅ 모듈별 API 서비스
export const moduleApi = {
  getItems: (params: Query) => apiClient.get<ItemList>('/items', { params }),
  createItem: (data: Request) => apiClient.post<Response>('/items', data),
};
```

## 테스트 & 품질 관리

```typescript
// ✅ 컴포넌트 테스트
describe('ComponentName', () => {
  it('[테스트 케이스 설명]', () => {
    // 테스트 로직...
  });
});

// ✅ API 모킹
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.json({ success: true, data: [] }));
  }),
];
```

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run test         # 테스트
npm run type-check   # 타입 체크
npm run lint         # 린트
```

## 주의사항

### ❌ 금지 사항
- **console.log 운영 코드 포함 금지**
- **any 타입 사용 금지**
- **[프로젝트별 금지 사항 추가]**

### ✅ 준수 사항
- **[프로젝트별 준수 사항 작성]**

---

# Part 2: 산출물 생성 가이드 (모든 프로젝트 공통)

## 문서 관리 규칙

### 화면 변경 시 문서 업데이트 (필수)
**화면이 업데이트, 추가, 삭제될 때마다 반드시 관련 .md 문서들을 함께 업데이트해야 합니다.**

```
화면 변경 시 업데이트 대상 문서:
├── docs/INFORMATION_ARCHITECTURE.md    # IA 구조, 사이트맵
├── docs/SCREEN_SPECIFICATIONS.md       # 화면별 기능 명세
├── docs/API_SPECIFICATION.md           # 연관 API 엔드포인트
├── docs/DESIGN_SYSTEM.md              # 새로운 UI 패턴 (필요시)
└── README.md                          # 전체 기능 목록
```

### 문서 동기화 체크리스트
- [ ] IA 문서의 사이트맵이 실제 라우팅과 일치하는가?
- [ ] 화면 명세가 실제 구현된 기능과 일치하는가?
- [ ] API 명세가 실제 사용되는 엔드포인트와 일치하는가?
- [ ] README의 기능 목록이 최신 상태인가?

## 프로젝트 산출물 생성 가이드

**새 프로젝트에서 동일한 산출물 구조를 만들기 위한 가이드입니다.**

### 1. README.md 작성 규칙

README.md는 프로젝트의 첫인상이자 전체 개요를 제공합니다.

```markdown
# [프로젝트명]

## 프로젝트 개요
- **목적**: 한 줄 요약
- **사용자**: 대상 사용자군
- **환경**: 배포 환경 (모바일, 데스크톱, 하이브리드 등)

## 기술 스택
[![기술명](https://img.shields.io/badge/기술명-버전-색상코드?logo=로고명)](링크)
- shields.io를 활용한 배지 형식으로 주요 기술 스택 표시
- 예: React, TypeScript, Vite, TailwindCSS, Radix UI 등

## 주요 기능
- **기능 1**: 설명
- **기능 2**: 설명
- 업무 모듈별로 계층 구조로 정리

## 프로젝트 구조
```
src/
├── components/
│   ├── ui/
│   ├── common/
│   ├── screens/
│   └── layout/
├── stores/
├── hooks/
...
```

## 개발 가이드
### 시작하기
```bash
npm install
npm run dev
```

### 주요 명령어
- `npm run dev`: 개발 서버
- `npm run build`: 프로덕션 빌드
- `npm run test`: 테스트 실행

## 문서
- [정보구조도](./docs/INFORMATION_ARCHITECTURE.md)
- [화면명세서](./docs/SCREEN_SPECIFICATIONS.md)
- [API명세서](./docs/API_SPECIFICATION.md)
- [디자인시스템](./docs/DESIGN_SYSTEM.md)

## 프로젝트 진행률
![Progress](https://img.shields.io/badge/진행률-XX%25-색상코드)
- 완료된 모듈: N/M
- 현재 진행 중: Phase X
```

### 2. 정보구조도 (INFORMATION_ARCHITECTURE.md) 작성 규칙

**목적**: 전체 사이트맵과 화면 간 네비게이션 구조를 명확히 정의

```markdown
# [프로젝트명] 정보구조도

## 개요
시스템의 전체 화면 구조와 네비게이션 경로를 정의합니다.

## 홈 화면 메뉴 구조 (X개 메뉴)
```
홈 화면 (HomeScreen)
├── 메뉴1 (/path1)
├── 메뉴2 (/path2)
└── 메뉴N (/pathN)
```

## 전체 사이트맵 (Implemented Features Only)
```
[앱명]
├── 인증 (Authentication)
│   └── 로그인 (/login) - LoginScreen
│
├── 메인 홈 (Home Dashboard)
│   └── 런처 (/home) - HomeScreen
│
├── 업무모듈1 (Module 1) - /module1
│   ├── 목록 (/) - Module1ListScreen
│   └── 상세 (/:id)
│       ├── 상세 정보 (/) - Module1DetailScreen
│       ├── 하위기능1 (/sub1) - Sub1Screen
│       └── 하위기능2 (/sub2) - Sub2Screen
│
└── 설정 (Settings) - /settings
    └── 설정 화면 (/) - SettingsScreen
```

## 화면 설명

### 인증 및 홈
- **LoginScreen**: 로그인 화면 설명
- **HomeScreen**: 메인 런처 화면 설명

### 업무모듈1
- **Module1ListScreen**: 목록 화면 설명
- **Module1DetailScreen**: 상세 화면 설명
- 각 화면의 역할과 주요 기능 간략 설명

---
*참고: 특별한 네비게이션 규칙이 있다면 여기에 명시*
```

**작성 규칙**:
- 반드시 실제 구현된 화면만 포함 (플레이스홀더 제외)
- 라우트 경로와 컴포넌트명을 정확히 매칭
- AppRouter.tsx의 실제 라우팅 구조와 100% 일치해야 함
- 화면명은 [기능명]Screen 형태로 통일

### 3. 화면명세서 (SCREEN_SPECIFICATIONS.md) 생성 규칙

**목적**: 각 화면의 UI, 기능, 프로세스를 스크린샷과 함께 문서화

#### 3.1. 스크린샷 캡처 자동화

**scripts/capture-[기능명].mjs 패턴**:
```javascript
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 } // 모바일 뷰포트 (프로젝트에 맞게 조정)
  });
  const page = await context.newPage();

  // 개발 서버 접속
  await page.goto('http://localhost:[포트]/[경로]');
  await page.waitForLoadState('networkidle');

  // 1. 초기 화면 캡처
  await page.screenshot({
    path: 'docs/screenshots/feature-screen.png',
    fullPage: false
  });

  // 2. 인터랙션 후 캡처 (필요시)
  await page.click('button#some-button');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'docs/screenshots/feature-modal.png',
    fullPage: false
  });

  // 3. 스크롤 화면 캡처 (긴 페이지용)
  await page.evaluate(() => {
    const scrollContainers = document.querySelectorAll('div');
    for (const container of scrollContainers) {
      const style = window.getComputedStyle(container);
      if (style.overflowY === 'auto' || style.overflow === 'auto') {
        container.scrollTop = container.scrollHeight;
      }
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'docs/screenshots/feature-screen-scrolled.png',
    fullPage: false
  });

  await browser.close();
  console.log('✅ 스크린샷 캡처 완료');
})();
```

**스크린샷 명명 규칙**:
- 기본 화면: `[기능명]-[화면명].png` (예: settings-main.png)
- 스크롤 화면: `[기능명]-[화면명]-scrolled.png` (예: settings-main-scrolled.png)
- 모달/팝업: `[기능명]-[요소명]-modal.png` (예: settings-printer-modal.png)
- 저장 위치: `docs/screenshots/`

**스크린샷 캡처 시기**:
- 세로로 긴 화면: 상단/하단 2장 캡처 (dual screenshot)
- 모달/드롭다운: 열린 상태 캡처
- 탭 전환: 각 탭별 캡처
- 상태 변화: 변화 전/후 캡처

#### 3.2. 화면명세서 자동 생성 스크립트

**scripts/generate-complete-spec.cjs 패턴**:
```javascript
const fs = require('fs');
const path = require('path');

const screens = [
  {
    id: 'PD-XXX-001',
    category: '카테고리명',
    name: '화면명',
    route: '/route/path',
    component: 'ScreenName',
    screenshot: 'screenshot-name.png',
    screenshotScrolled: 'screenshot-name-scrolled.png', // 선택적
    features: [
      '주요 기능 1',
      '주요 기능 2',
      '주요 기능 3'
    ],
    process: [
      { step: 1, action: '사용자가 수행하는 액션', result: '시스템 반응' },
      { step: 2, action: '다음 액션', result: '다음 반응' }
    ]
  },
  // ... 모든 화면 정의
];

function generateMarkdown() {
  let markdown = `# 화면 명세서\n\n`;
  markdown += `**문서 버전**: 1.0\n`;
  markdown += `**최종 수정일**: ${new Date().toISOString().split('T')[0]}\n\n`;

  // 카테고리별 그룹화
  const categories = {};
  screens.forEach(screen => {
    if (!categories[screen.category]) {
      categories[screen.category] = [];
    }
    categories[screen.category].push(screen);
  });

  // 각 카테고리별 테이블 생성
  Object.keys(categories).forEach(category => {
    markdown += `## ${category}\n\n`;
    markdown += `<table>\n`;
    markdown += `<tr>\n`;
    markdown += `  <th style="width: 10%;">화면 ID</th>\n`;
    markdown += `  <th style="width: 15%;">화면명</th>\n`;
    markdown += `  <th style="width: 50%;">화면 이미지</th>\n`;
    markdown += `  <th style="width: 25%;">주요 기능</th>\n`;
    markdown += `</tr>\n`;

    categories[category].forEach(screen => {
      markdown += `<tr>\n`;
      markdown += `  <td>${screen.id}</td>\n`;
      markdown += `  <td><strong>${screen.name}</strong><br/><code>${screen.route}</code></td>\n`;

      // 스크린샷 처리 (dual screenshot 지원)
      if (screen.screenshotScrolled) {
        markdown += `  <td style="width: 50%;">\n`;
        markdown += `    <div style="display: flex; gap: 10px;">\n`;
        markdown += `      <div style="text-align: center;">\n`;
        markdown += `        <img src="./screenshots/${screen.screenshot}" style="height: 200px;" alt="${screen.name} (상단)" />\n`;
        markdown += `        <div>상단 화면</div>\n`;
        markdown += `      </div>\n`;
        markdown += `      <div style="text-align: center;">\n`;
        markdown += `        <img src="./screenshots/${screen.screenshotScrolled}" style="height: 200px;" alt="${screen.name} (하단)" />\n`;
        markdown += `        <div>하단 화면</div>\n`;
        markdown += `      </div>\n`;
        markdown += `    </div>\n`;
        markdown += `  </td>\n`;
      } else {
        markdown += `  <td><img src="./screenshots/${screen.screenshot}" alt="${screen.name}" style="max-width: 100%; height: auto;" /></td>\n`;
      }

      markdown += `  <td>\n`;
      markdown += `    <strong>주요 기능:</strong>\n`;
      markdown += `    <ul>\n`;
      screen.features.forEach(feature => {
        markdown += `      <li>${feature}</li>\n`;
      });
      markdown += `    </ul>\n`;
      markdown += `    <strong>프로세스:</strong>\n`;
      markdown += `    <ol>\n`;
      screen.process.forEach(p => {
        markdown += `      <li>${p.action} → ${p.result}</li>\n`;
      });
      markdown += `    </ol>\n`;
      markdown += `  </td>\n`;
      markdown += `</tr>\n`;
    });

    markdown += `</table>\n\n`;
  });

  return markdown;
}

// 파일 생성
const markdown = generateMarkdown();
fs.writeFileSync(
  path.join(__dirname, '../docs/SCREEN_SPECIFICATIONS.md'),
  markdown,
  'utf8'
);
console.log('✅ SCREEN_SPECIFICATIONS.md 생성 완료');
```

**실행 방법**:
```bash
# 1. 스크린샷 캡처
node scripts/capture-login.mjs
node scripts/capture-settings.mjs
# ... 모든 화면 캡처

# 2. 명세서 생성
node scripts/generate-complete-spec.cjs
```

### 4. API 명세서 (API_SPECIFICATION.md) 작성 규칙

**목적**: 프론트엔드에서 호출하는 모든 API 엔드포인트 문서화

```markdown
# API 명세서

**Base URL**: `https://api.example.com/api/v1`

## 1. 인증 API

### 1.1. 일반 로그인
- **Endpoint**: `POST /auth/login`
- **설명**: 사용자명/비밀번호 기반 로그인
- **Request**:
```json
{
  "username": "user001",
  "password": "password123"
}
```
- **Response (성공)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyByZWZyZXNo...",
    "user": {
      "id": "U001",
      "username": "user001",
      "name": "홍길동",
      "department": "개발팀"
    }
  },
  "timestamp": "2025-01-07T10:30:00Z"
}
```
- **Response (실패)**:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다."
  },
  "timestamp": "2025-01-07T10:30:00Z"
}
```

### 1.2. [다른 API]
- **Endpoint**: `[METHOD] /path`
- **설명**: ...
- **Request**: ...
- **Response**: ...

## 2. [모듈명] API

### 2.1. [기능명]
- **Endpoint**: `[METHOD] /path`
- **Query Parameters**:
  - `param1`: 설명
  - `param2`: 설명
- **Response**: ...

## 공통 응답 형식

모든 API는 다음 형식을 따릅니다:

**성공 응답**:
```json
{
  "success": true,
  "data": { /* 실제 데이터 */ },
  "message": "선택적 메시지",
  "timestamp": "ISO 8601 형식",
  "requestId": "요청 추적용 UUID"
}
```

**실패 응답**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 오류 메시지",
    "details": "개발자용 상세 정보 (선택적)"
  },
  "timestamp": "ISO 8601 형식",
  "requestId": "요청 추적용 UUID"
}
```

## HTTP 상태 코드
- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류
```

**작성 규칙**:
- 업무 모듈별로 섹션 분리
- 각 엔드포인트마다 Request/Response 예시 필수
- 에러 코드와 메시지 명시
- 인증 헤더 요구사항 명시 (JWT 등)

### 5. 산출물 생성 워크플로우

**새 프로젝트 시작 시**:
```bash
# 1. 프로젝트 구조 생성
npm create vite@latest project-name -- --template react-ts
cd project-name

# 2. 문서 디렉토리 생성
mkdir -p docs/screenshots scripts

# 3. 기본 문서 파일 생성
touch docs/INFORMATION_ARCHITECTURE.md
touch docs/SCREEN_SPECIFICATIONS.md
touch docs/API_SPECIFICATION.md
touch docs/DESIGN_SYSTEM.md

# 4. 스크립트 디렉토리 생성
touch scripts/generate-complete-spec.cjs

# 5. README.md 작성 (위 템플릿 참고)
```

**화면 구현 후 문서 생성 프로세스**:
1. 화면 구현 완료
2. 스크린샷 캡처 스크립트 작성 (`scripts/capture-[기능명].mjs`)
3. 스크린샷 캡처 실행
4. `generate-complete-spec.cjs`의 screens 배열에 화면 정보 추가
5. 명세서 자동 생성 실행
6. IA 문서에 라우팅 정보 수동 업데이트
7. API 명세서에 사용된 엔드포인트 추가
8. README.md의 기능 목록 업데이트

**Git 커밋 패턴**:
```bash
git add docs/ scripts/
git commit -m "docs: [기능명] 화면 명세서 및 스크린샷 추가

- [기능명] 스크린샷 캡처 (N개)
- SCREEN_SPECIFICATIONS.md 업데이트
- INFORMATION_ARCHITECTURE.md 사이트맵 추가
- API_SPECIFICATION.md [기능명] API 추가

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 6. 자동화 팁

**package.json에 스크립트 추가**:
```json
{
  "scripts": {
    "capture:all": "node scripts/capture-login.mjs && node scripts/capture-home.mjs && ...",
    "docs:generate": "node scripts/generate-complete-spec.cjs",
    "docs:update": "npm run capture:all && npm run docs:generate"
  }
}
```

**실행**:
```bash
npm run docs:update  # 모든 스크린샷 재캡처 + 명세서 재생성
```

---

**이 템플릿을 활용하여 어떤 프로젝트에서도 일관된 품질의 문서 산출물을 생성하세요.**
