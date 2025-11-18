# MatchUp - 디자인 시스템 (Design System)

**버전**: 1.0
**최종 수정일**: 2025-01-18

---

## 1. 브랜드 아이덴티티

### 1.1. 브랜드 핵심 가치

- **연결 (Connection)**: 아이디어와 기술의 연결
- **협업 (Collaboration)**: 함께 성장하는 파트너십
- **신뢰 (Trust)**: 투명하고 공정한 매칭
- **성장 (Growth)**: 모두가 성공하는 생태계

### 1.2. 톤 & 보이스

| 특성 | 설명 | 예시 |
|------|------|------|
| 전문적 | 신뢰감 있는 비즈니스 톤 | "프로젝트가 성공적으로 등록되었습니다" |
| 친근함 | 부담 없는 대화체 | "안녕하세요! 새로운 기회가 기다리고 있어요" |
| 명확함 | 간결하고 이해하기 쉬운 | "지원 완료" (O) / "지원이 정상적으로 처리되었습니다" (X) |
| 긍정적 | 동기부여하는 메시지 | "첫 번째 프로젝트를 시작해보세요!" |

---

## 2. 컬러 시스템

### 2.1. Primary Colors

```css
/* Primary - 브랜드 메인 컬러 */
--primary-50: #EEF2FF;
--primary-100: #E0E7FF;
--primary-200: #C7D2FE;
--primary-300: #A5B4FC;
--primary-400: #818CF8;
--primary-500: #6366F1;  /* 메인 */
--primary-600: #4F46E5;
--primary-700: #4338CA;
--primary-800: #3730A3;
--primary-900: #312E81;
```

### 2.2. Secondary Colors

```css
/* Secondary - 보조 컬러 */
--secondary-50: #F0FDF4;
--secondary-100: #DCFCE7;
--secondary-200: #BBF7D0;
--secondary-300: #86EFAC;
--secondary-400: #4ADE80;
--secondary-500: #22C55E;  /* 메인 */
--secondary-600: #16A34A;
--secondary-700: #15803D;
--secondary-800: #166534;
--secondary-900: #14532D;
```

### 2.3. Neutral Colors

```css
/* Gray Scale */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 2.4. Semantic Colors

```css
/* Success */
--success-light: #D1FAE5;
--success-main: #10B981;
--success-dark: #065F46;

/* Warning */
--warning-light: #FEF3C7;
--warning-main: #F59E0B;
--warning-dark: #92400E;

/* Error */
--error-light: #FEE2E2;
--error-main: #EF4444;
--error-dark: #991B1B;

/* Info */
--info-light: #DBEAFE;
--info-main: #3B82F6;
--info-dark: #1E40AF;
```

### 2.5. 역할별 컬러

```css
/* Role Colors */
--role-dev: #3B82F6;      /* 개발자 - Blue */
--role-biz: #8B5CF6;      /* 운영자 - Purple */
--role-marketing: #F59E0B; /* 마케터 - Amber */
--role-design: #EC4899;    /* 디자이너 - Pink */
```

### 2.6. 다크 모드

```css
/* Dark Mode - 배경 */
--dark-bg-primary: #0F172A;
--dark-bg-secondary: #1E293B;
--dark-bg-tertiary: #334155;

/* Dark Mode - 텍스트 */
--dark-text-primary: #F8FAFC;
--dark-text-secondary: #CBD5E1;
--dark-text-tertiary: #94A3B8;
```

---

## 3. 타이포그래피

### 3.1. 폰트 패밀리

```css
/* 기본 폰트 */
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* 모노스페이스 */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2. 폰트 스케일

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 48px | 1.1 | 700 | 히어로 섹션 |
| H1 | 36px | 1.2 | 700 | 페이지 제목 |
| H2 | 30px | 1.3 | 600 | 섹션 제목 |
| H3 | 24px | 1.4 | 600 | 카드 제목 |
| H4 | 20px | 1.4 | 600 | 서브 제목 |
| H5 | 18px | 1.5 | 600 | 리스트 제목 |
| Body-lg | 18px | 1.6 | 400 | 강조 본문 |
| Body | 16px | 1.6 | 400 | 일반 본문 |
| Body-sm | 14px | 1.5 | 400 | 보조 텍스트 |
| Caption | 12px | 1.4 | 400 | 캡션, 라벨 |
| Tiny | 10px | 1.3 | 500 | 배지, 태그 |

### 3.3. 폰트 Weight

```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 4. 스페이싱

### 4.1. 스페이싱 스케일

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 4.2. 컨테이너

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

---

## 5. 그림자 & 효과

### 5.1. 그림자 레벨

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### 5.2. Border Radius

```css
--radius-none: 0px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

---

## 6. 아이콘

### 6.1. 아이콘 라이브러리

- **Lucide Icons**: 기본 UI 아이콘
- **Custom Icons**: 브랜드 특화 아이콘

### 6.2. 아이콘 사이즈

| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12px | 인라인 아이콘 |
| sm | 16px | 버튼 내부 |
| md | 20px | 기본 아이콘 |
| lg | 24px | 네비게이션 |
| xl | 32px | 강조 아이콘 |
| 2xl | 48px | 빈 상태 |

### 6.3. 역할 아이콘

```
개발자: 💻 / Code
운영자: 📊 / Briefcase
마케터: 📈 / TrendingUp
디자이너: 🎨 / Palette
```

---

## 7. 컴포넌트

### 7.1. Button

**Variants**

```jsx
// Primary - 주요 액션
<Button variant="primary">지원하기</Button>

// Secondary - 보조 액션
<Button variant="secondary">더 보기</Button>

// Outline - 대체 액션
<Button variant="outline">취소</Button>

// Ghost - 최소 강조
<Button variant="ghost">뒤로</Button>

// Destructive - 위험 액션
<Button variant="destructive">삭제</Button>
```

**Sizes**

```jsx
<Button size="sm">작은 버튼</Button>  // height: 32px
<Button size="md">기본 버튼</Button>  // height: 40px
<Button size="lg">큰 버튼</Button>    // height: 48px
```

**States**

- Default
- Hover (밝기 -10%)
- Active (밝기 -15%)
- Disabled (opacity: 0.5)
- Loading (spinner 표시)

---

### 7.2. Input

**Types**

```jsx
// Text Input
<Input type="text" placeholder="이름을 입력하세요" />

// Password Input
<Input type="password" />

// Textarea
<Textarea rows={4} placeholder="내용을 입력하세요" />

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">옵션 1</SelectItem>
  </SelectContent>
</Select>
```

**States**

- Default: `border-gray-300`
- Focus: `border-primary-500, ring-2 ring-primary-500/20`
- Error: `border-error-main`
- Disabled: `bg-gray-100, cursor-not-allowed`

---

### 7.3. Card

```jsx
// Basic Card
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
  <CardFooter>
    <Button>액션</Button>
  </CardFooter>
</Card>
```

**Project Card 스타일**

```css
.project-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

---

### 7.4. Badge / Tag

```jsx
// Role Badge
<Badge variant="dev">개발자</Badge>
<Badge variant="biz">운영자</Badge>
<Badge variant="marketing">마케터</Badge>
<Badge variant="design">디자이너</Badge>

// Status Badge
<Badge variant="success">수락됨</Badge>
<Badge variant="warning">대기중</Badge>
<Badge variant="error">거절됨</Badge>

// Category Tag
<Tag>앱</Tag>
<Tag>웹</Tag>
<Tag>AI</Tag>
```

---

### 7.5. Avatar

```jsx
// Size Variants
<Avatar size="xs" />  // 24px
<Avatar size="sm" />  // 32px
<Avatar size="md" />  // 40px
<Avatar size="lg" />  // 56px
<Avatar size="xl" />  // 80px

// With Fallback
<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>HG</AvatarFallback>
</Avatar>
```

---

### 7.6. Modal / Dialog

```jsx
<Dialog>
  <DialogTrigger>열기</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
      <DialogDescription>설명</DialogDescription>
    </DialogHeader>
    <div>내용</div>
    <DialogFooter>
      <Button variant="outline">취소</Button>
      <Button>확인</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Modal Sizes**

- sm: 400px
- md: 500px (기본)
- lg: 640px
- xl: 768px
- full: 100%

---

### 7.7. Toast / Notification

```jsx
// Success
toast.success('저장되었습니다');

// Error
toast.error('오류가 발생했습니다');

// Warning
toast.warning('주의가 필요합니다');

// Info
toast.info('알림 메시지');
```

**Position**

- top-right (기본)
- top-center
- bottom-right
- bottom-center

---

### 7.8. Tabs

```jsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">개요</TabsTrigger>
    <TabsTrigger value="team">팀 구성</TabsTrigger>
    <TabsTrigger value="condition">조건</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">개요 내용</TabsContent>
  <TabsContent value="team">팀 구성 내용</TabsContent>
  <TabsContent value="condition">조건 내용</TabsContent>
</Tabs>
```

---

### 7.9. Progress

```jsx
// Linear Progress
<Progress value={65} />

// Step Progress
<StepProgress current={2} total={4} />

// Circular Progress
<CircularProgress value={75} />
```

---

### 7.10. Empty State

```jsx
<EmptyState
  icon={<SearchIcon />}
  title="검색 결과가 없습니다"
  description="다른 키워드로 검색해보세요"
  action={<Button>필터 초기화</Button>}
/>
```

---

## 8. 레이아웃 패턴

### 8.1. 페이지 레이아웃

```jsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <Header />

  {/* Main Content */}
  <main className="container mx-auto px-4 py-6">
    {children}
  </main>

  {/* Bottom Navigation (Mobile) */}
  <BottomNav />
</div>
```

### 8.2. 카드 그리드

```css
/* 반응형 카드 그리드 */
.card-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 8.3. 폼 레이아웃

```jsx
<form className="space-y-6">
  <FormField>
    <FormLabel>이름</FormLabel>
    <FormInput />
    <FormMessage />
  </FormField>

  <FormField>
    <FormLabel>이메일</FormLabel>
    <FormInput type="email" />
    <FormMessage />
  </FormField>

  <Button type="submit">제출</Button>
</form>
```

---

## 9. 애니메이션

### 9.1. 트랜지션

```css
/* 기본 트랜지션 */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 9.2. 애니메이션 효과

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Spin (Loading) */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 9.3. Framer Motion 프리셋

```jsx
// Page Transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// List Item Stagger
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};
```

---

## 10. 반응형 디자인

### 10.1. Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 10.2. 모바일 우선 설계

```css
/* Mobile First */
.component {
  padding: var(--space-4);
  font-size: 14px;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: var(--space-6);
    font-size: 16px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-8);
  }
}
```

### 10.3. 반응형 타이포그래피

```css
/* Responsive Font Size */
.heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}
```

---

## 11. 접근성 (Accessibility)

### 11.1. 색상 대비

- **일반 텍스트**: 최소 4.5:1
- **큰 텍스트**: 최소 3:1
- **UI 컴포넌트**: 최소 3:1

### 11.2. 포커스 스타일

```css
/* Focus Visible */
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Focus Ring */
.focus-ring:focus-visible {
  ring-width: 2px;
  ring-color: var(--primary-500);
  ring-opacity: 0.5;
}
```

### 11.3. ARIA 라벨

```jsx
// 아이콘 버튼
<Button aria-label="설정">
  <SettingsIcon />
</Button>

// 로딩 상태
<Button disabled aria-busy="true">
  <Spinner />
  로딩 중...
</Button>

// 에러 메시지
<Input aria-invalid="true" aria-describedby="error-message" />
<span id="error-message">이메일 형식이 올바르지 않습니다</span>
```

---

## 12. Tailwind CSS 설정

### 12.1. tailwind.config.js

```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // ... 나머지 컬러
      },
      fontFamily: {
        sans: ['Pretendard', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        // 커스텀 그림자
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 13. 컴포넌트 라이브러리

### 13.1. shadcn/ui 사용

```bash
# 컴포넌트 설치
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

### 13.2. 커스텀 컴포넌트

- `ProjectCard`
- `UserCard`
- `RoleBadge`
- `EquityChart`
- `StepProgress`
- `EmptyState`

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
