# 데이터 주입을 위한 Mock API 및 인터페이스 정의

## 개요
- **타입**: research
- **우선순위**: medium
- **담당 에이전트**: Backend
- **완료일**: 2026-02-13

## 태스크 설명
Backend 연동 전, 프론트엔드에서 사용할 도메인 모델(Task, Project 등)의 인터페이스를 정의하고 테스트용 Mock 데이터를 구성합니다.

---
*Follow-up from: 단일 HTML 파일 기반 및 UI 프레임워크 구축*

## 작업 보고서
백엔드 개발자로서, 프론트엔드 개발팀이 실제 DB 연동 전에도 개발을 진행할 수 있도록 **도메인 모델 정의**, **데이터베이스 스키마 설계**, 그리고 **Mock 데이터를 반환하는 Edge Function**을 작성하겠습니다.

### 1. 데이터베이스 스키마 정의 (SQL)

먼저 프로젝트와 태스크의 관계를 정의하는 스키마입니다. 이 스키마는 향후 실제 DB 연동 시 기반이 됩니다.

```sql
-- filepath:supabase/migrations/20240522000000_create_initial_schema.sql

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  assignee TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mock Data Injection
INSERT INTO projects (id, name, description) VALUES
('p1-uuid', 'NextGen AI Platform', 'AI 기반 비즈니스 자동화 솔루션 구축 프로젝트'),
('p2-uuid', 'Global Expansion', '동남아시아 시장 진출을 위한 로컬라이징 프로젝트');

INSERT INTO tasks (project_id, title, status, priority, assignee) VALUES
('p1-uuid', 'Backend Architecture Design', 'IN_PROGRESS', 'HIGH', 'John Doe'),
('p1-uuid', 'API Documentation', 'TODO', 'MEDIUM', 'Jane Smith'),
('p2-uuid', 'Market Research - Vietnam', 'DONE', 'HIGH', 'Alice Wong');
```

### 2. 도메인 모델 인터페이스 정의 (TypeScript)

Edge Function과 프론트엔드에서 공통으로 사용할 수 있는 타입 정의입니다.

```typescript
-- filepath:supabase/functions/_shared/types.ts

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  due_date?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
```

### 3. Mock API Edge Function 구현

프론트엔드에서 `POST /mock-api`를 호출하여 가상 데이터를 즉시 받아올 수 있는 로직입니다.

```typescript
-- filepath:supabase/functions/mock-api/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Project, Task, ApiResponse } from "../_shared/types.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()

    // Mock Data
    const mockProjects: Project[] = [
      { id: 'p1-uuid', name: 'NextGen AI Platform', description: 'AI 기반 비즈니스 자동화 솔루션 구축 프로젝트', created_at: new Date().toISOString() },
      { id: 'p2-uuid', name: 'Global Expansion', description: '동남아시아 시장 진출을 위한 로컬라이징 프로젝트', created_at: new Date().toISOString() }
    ];

    const mockTasks: Task[] = [
      { id: 't1', project_id: 'p1-uuid', title: 'Backend Architecture Design', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'John Doe', created_at: new Date().toISOString() },
      { id: 't2', project_id: 'p1-uuid', title: 'API Documentation', status: 'TODO', priority: 'MEDIUM', assignee: 'Jane Smith', created_at: new Date().toISOString() },
      { id: 't3', project_id: 'p2-uuid', title: 'Market Research - Vietnam', status: 'DONE', priority: 'HIGH', assignee: 'Alice Wong', created_at: new Date().toISOString() }
    ];

    let responseData: ApiResponse<any>;

    switch (action) {
      case 'getProjects':
        responseData = { data: mockProjects, error: null };
        break;
      case 'getTasks':
        responseData = { data: mockTasks, error: null };
        break;
      default:
        responseData = { data: null, error: 'Invalid action' };
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ data: null, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
```

---

### 작업 요약 및 결과

#### 1. 생성/수정된 파일 목록
- `supabase/migrations/20240522000000_create_initial_schema.sql`: DB 스키마 및 초기 시드 데이터.
- `supabase/functions/_shared/types.ts`: 프론트-백엔드 간 데이터 규격 정의 (TypeScript).
- `supabase/functions/mock-api/index.ts`: 가상의 데이터를 반환하는 Supabase Edge Function.

#### 2. 주요 구현 결정 사항
- **통합 응답 인터페이스**: `ApiResponse<T>` 형식을 도입하여 성공/실패 시에도 일관된 JSON 구조를 반환하도록 설계했습니다.
- **Action 기반 Mocking**: 하나의 Edge Function에서 `action` 파라미터에 따라 프로젝트 리스트나 태스크 리스트를 선택적으로 반환하도록 하여 API 관리 효율성을 높였습니다.
- **CORS 설정**: 프론트엔드 로컬 환경에서 Edge Function을 직접 호출할 수 있도록 CORS 헤더를 명시적으로 처리했습니다.

#### 3. 테스트 권장 사항
- **Postman/cURL 테스트**:
  ```bash
  curl -X POST https://[YOUR_PROJECT_REF].functions.supabase.co/mock-api \
    -H "Content-Type: application/json" \
    -d '{"action": "getProjects"}'
  ```
- **프론트엔드 연동**: 정의된 `Task`, `Project` 인터페이스를 프론트엔드 소스 코드로 복사하여 타입 안정성을 확보한 후 Fetch를 수행하십시오.

#### 4. 다음 단계
- **Real-DB 연동**: `mock-api` 로직을 실제 Supabase Client 라이브러리를 사용해 PostgreSQL 데이터를 조회하는 로직으로 전환.
- **인증(Auth) 추가**: `supabase.auth.getUser()`를 사용하여 사용자별 데이터 필터링 적용.
- **CRUD 확장**: 단순 조회를 넘어 생성(Create), 수정(Update) 기능을 추가할 예정입니다.

---
*이 문서는 AI 에이전트에 의해 자동 생성되었습니다.*
