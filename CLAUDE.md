# MatchUp - 개발 규칙 (CLAUDE.md)

> Claude Code가 이 프로젝트를 개발할 때 따라야 하는 규칙입니다.

---

## 프로젝트 개요

- **프로젝트명**: MatchUp
- **목적**: 아이디어 보유자와 기술 보유자를 지분/수익 공유 방식으로 매칭하는 협업 플랫폼
- **기술스택**: React 18 + TypeScript + Vite + Supabase + Tailwind CSS
- **포트**: 5173 (개발 서버)

---

## 핵심 개발 철학

### 1. Supabase 우선 원칙

- **데이터베이스**: 항상 Supabase PostgreSQL 사용
- **인증**: Supabase Auth 사용 (별도 인증 서버 구현 금지)
- **스토리지**: Supabase Storage 사용
- **실시간**: Supabase Realtime 사용
- **API**: 단순 CRUD는 Supabase REST API, 복잡한 로직은 Edge Functions

### 2. FE/BE 책임 범위

```
✅ FE 담당:
- UI 렌더링 및 상태 관리
- 입력 유효성 검사 (Zod)
- Optimistic Updates
- 캐싱 전략 (TanStack Query)
- 실시간 구독 처리

❌ BE 담당 (FE에서 구현 금지):
- 비즈니스 로직 (결제 처리, 계약서 생성 등)
- 데이터베이스 트리거/함수
- 복잡한 쿼리 (RPC 사용)
- 외부 API 연동 (Stripe, SendGrid)
- 민감한 데이터 처리
```

### 3. 보안 우선

- 모든 테이블에 RLS 정책 적용
- 민감한 API 키는 Edge Functions에만
- 클라이언트에서 직접 DB 조작 최소화

---

## 기술 스택 & 구조

### 필수 기술 스택

```
Runtime: React 18 + TypeScript 5
Build: Vite 5
State: Zustand (클라이언트), TanStack Query (서버)
Style: Tailwind CSS 3.4 + shadcn/ui
Router: React Router v6
Forms: React Hook Form + Zod
Backend: Supabase (Auth, DB, Storage, Functions)
```

### 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── common/          # 공통 컴포넌트 (Header, Footer, etc.)
│   ├── screens/         # 페이지별 컴포넌트
│   │   ├── auth/
│   │   ├── home/
│   │   ├── project/
│   │   ├── profile/
│   │   ├── meeting/
│   │   └── contract/
│   └── layout/          # 레이아웃 컴포넌트
├── stores/              # Zustand 스토어
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── uiStore.ts
├── hooks/               # 커스텀 훅
│   ├── useAuth.ts
│   ├── useProject.ts
│   └── useRealtime.ts
├── services/            # API 서비스
│   ├── supabase.ts      # Supabase 클라이언트
│   ├── authService.ts
│   ├── projectService.ts
│   └── paymentService.ts
├── types/               # TypeScript 타입
│   ├── user.ts
│   ├── project.ts
│   └── application.ts
├── utils/               # 유틸리티
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── lib/                 # 라이브러리 설정
│   └── queryClient.ts
└── routes/              # 라우팅
    └── AppRouter.tsx
```

---

## 코딩 컨벤션

### 1. 명명 규칙

```typescript
// 컴포넌트: PascalCase
const LoginScreen = () => { };
const ProjectCard = () => { };

// 변수/함수: camelCase
const userName = 'john';
const handleSubmit = () => { };

// 이벤트 핸들러: on[Action] 형태
const onLogin = () => { };
const onApply = () => { };

// 상수: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 타입/인터페이스: PascalCase
interface UserProfile { }
type ProjectStatus = 'active' | 'closed';

// 파일명:
// - 컴포넌트: PascalCase.tsx (LoginScreen.tsx)
// - 훅: camelCase.ts (useAuth.ts)
// - 서비스: camelCase.ts (authService.ts)
// - 타입: camelCase.ts (user.ts)
```

### 2. 컴포넌트 작성 규칙

```typescript
// ✅ 반드시 이 구조 준수
import { useState, useEffect, useMemo, useCallback } from 'react';

interface ProjectCardProps {
  project: Project;
  onBookmark: (id: string) => void;
}

export const ProjectCard = ({ project, onBookmark }: ProjectCardProps) => {
  // 1. State 변수들
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. 커스텀 훅들
  const { user } = useAuth();
  const { data: owner } = useQuery({ queryKey: ['user', project.owner_id] });

  // 3. 계산된 값들 (useMemo)
  const formattedDate = useMemo(() => {
    return format(project.created_at, 'yyyy.MM.dd');
  }, [project.created_at]);

  // 4. 이벤트 핸들러들 (useCallback)
  const handleBookmarkClick = useCallback(() => {
    onBookmark(project.id);
  }, [project.id, onBookmark]);

  // 5. 사이드 이펙트들 (useEffect)
  useEffect(() => {
    // 효과 로직
  }, []);

  // 6. 렌더링
  return (
    <div className="rounded-lg border bg-card">
      {/* JSX */}
    </div>
  );
};
```

### 3. 스타일링 규칙

```typescript
// ✅ Tailwind CSS + shadcn/ui 사용
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// ✅ 프로젝트 전용 색상 (tailwind.config.js에서 정의)
const colors = {
  'primary': '#6366F1',      // Indigo
  'secondary': '#22C55E',    // Green
  'role-dev': '#3B82F6',     // Blue
  'role-biz': '#8B5CF6',     // Purple
  'role-marketing': '#F59E0B', // Amber
  'role-design': '#EC4899',  // Pink
};

// ✅ 일관된 스페이싱
// space-2 (8px), space-4 (16px), space-6 (24px), space-8 (32px)

// ❌ 인라인 스타일 금지
<div style={{ marginTop: 10 }}>  // 금지
<div className="mt-4">           // 허용
```

---

## 프로젝트별 특화 규칙

### 1. Supabase 사용 규칙

```typescript
// ✅ Supabase 클라이언트 초기화 (services/supabase.ts)
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ✅ 타입 안전한 쿼리
const { data, error } = await supabase
  .from('projects')
  .select('*, profiles!owner_id(name, avatar_url)')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// ✅ Edge Function 호출
const { data, error } = await supabase.functions.invoke('create-project', {
  body: projectData,
});

// ❌ 클라이언트에서 직접 복잡한 로직 처리 금지
// 결제, 계약서 생성 등은 반드시 Edge Function 사용
```

### 2. 인증 처리 규칙

```typescript
// ✅ authStore (stores/authStore.ts)
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user, session: data.session });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

// ✅ 인증 상태 구독
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
    }
  );
  return () => subscription.unsubscribe();
}, []);
```

### 3. 실시간 구독 규칙

```typescript
// ✅ 알림 구독
const subscribeToNotifications = (userId: string) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // 새 알림 처리
        addNotification(payload.new as Notification);
      }
    )
    .subscribe();
};

// ✅ 컴포넌트에서 사용
useEffect(() => {
  if (!user) return;

  const subscription = subscribeToNotifications(user.id);

  return () => {
    supabase.removeChannel(subscription);
  };
}, [user]);
```

### 4. 폼 처리 규칙

```typescript
// ✅ React Hook Form + Zod 사용
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다'),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다'),
  roles_needed: z.array(z.string()).min(1, '최소 1개 역할을 선택하세요'),
  equity_distribution: z.record(z.number()),
});

type ProjectForm = z.infer<typeof projectSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>({
  resolver: zodResolver(projectSchema),
});
```

### 5. 데이터 페칭 규칙

```typescript
// ✅ TanStack Query 사용
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 조회
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => projectService.getProjects(filters),
  staleTime: 5 * 60 * 1000, // 5분
});

// 생성/수정
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: projectService.createProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    toast.success('프로젝트가 등록되었습니다');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

---

## API 통신 규칙

```typescript
// ✅ 서비스 계층 구조 (services/projectService.ts)
import { supabase } from './supabase';
import { Project, ProjectInsert, ProjectUpdate } from '@/types/project';

export const projectService = {
  // 목록 조회
  getProjects: async (filters?: ProjectFilters) => {
    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id(name, avatar_url, rating)
      `)
      .eq('status', 'active');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.roles) {
      query = query.contains('roles_needed', filters.roles);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 단일 조회
  getProject: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id(*),
        applications(id, applicant_id, status)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // 생성 (Edge Function 사용)
  createProject: async (project: ProjectInsert, paymentMethodId: string) => {
    const { data, error } = await supabase.functions.invoke('create-project', {
      body: { ...project, payment_method_id: paymentMethodId },
    });

    if (error) throw error;
    return data;
  },

  // 수정
  updateProject: async (id: string, updates: ProjectUpdate) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

## 테스트 & 품질 관리

```typescript
// ✅ 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  it('프로젝트 제목을 표시한다', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('AI 운동 추천')).toBeInTheDocument();
  });

  it('북마크 버튼 클릭 시 콜백이 호출된다', async () => {
    const onBookmark = vi.fn();
    render(<ProjectCard project={mockProject} onBookmark={onBookmark} />);

    await userEvent.click(screen.getByRole('button', { name: /북마크/ }));
    expect(onBookmark).toHaveBeenCalledWith(mockProject.id);
  });
});
```

---

## 개발 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run test         # 테스트
npm run test:watch   # 테스트 워치 모드
npm run type-check   # 타입 체크
npm run lint         # 린트
npm run lint:fix     # 린트 자동 수정
npm run format       # Prettier 포맷팅
```

---

## 주의사항

### ❌ 금지 사항

- **console.log 운영 코드 포함 금지** (개발 중에만 사용, 커밋 전 제거)
- **any 타입 사용 금지** (unknown 또는 구체적 타입 사용)
- **인라인 스타일 사용 금지** (Tailwind CSS 사용)
- **클라이언트에서 직접 결제/계약 처리 금지** (Edge Function 사용)
- **하드코딩된 API 키 금지** (환경 변수 사용)
- **index.ts에서 모든 것 export 금지** (직접 import)

### ✅ 준수 사항

- **모든 컴포넌트에 TypeScript 타입 정의**
- **API 호출 시 에러 핸들링 필수**
- **사용자 입력에 Zod 유효성 검사**
- **비동기 작업에 로딩/에러 상태 표시**
- **접근성 고려 (ARIA 라벨, 키보드 네비게이션)**
- **모바일 우선 반응형 디자인**

---

## 문서 관리 규칙

### 화면 변경 시 문서 업데이트 (필수)

화면이 업데이트, 추가, 삭제될 때마다 반드시 관련 .md 문서들을 함께 업데이트해야 합니다.

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

---

## Git 커밋 규칙

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

### 예시

```bash
feat(project): 프로젝트 등록 기능 구현

- 프로젝트 등록 폼 컴포넌트 추가
- Zod 스키마 유효성 검사 적용
- Edge Function 연동 및 결제 처리
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
