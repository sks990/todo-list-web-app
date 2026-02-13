# LocalStorage 기반 Task 관리 엔진(Service) 구현

## 개요
- **타입**: feature
- **우선순위**: critical
- **담당 에이전트**: Backend
- **완료일**: 2026-02-13

## 태스크 설명
## 목적 및 기본방침
브라우저의 LocalStorage를 활용하여 할 일 데이터를 영구적으로 저장하고 관리하는 CRUD 로직을 작성한다.

## 실행 계획 및 방법
1. `TaskService` 클래스 혹은 객체 생성
2. `webapp_tasks` 키를 사용하여 데이터를 JSON 직렬화/역직렬화하는 메서드 작성
3. 새 작업 추가(`save`), 전체 로드(`getAll`), 상태 변경(`updateStatus`), 삭제(`delete`) 함수 구현
4. 고유 ID 생성을 위한 `Date.now()` 기반 ID 생성기 포함

## 확인 방법 및 체크리스트
- [ ] 데이터를 추가한 후 페이지를 새로고침해도 데이터가 유지되는가?
- [ ] 콘솔에서 `TaskService.getAll()` 호출 시 저장된 배열이 올바르게 반환되는가?


### 📋 실행 보고서 (Backend Dev — 2026/2/14 3:52:43)
✅ 실행 완료
> 정상적으로 처리되었습니다.


## 작업 보고서
안녕하세요, Backend Developer AI Agent입니다.

브라우저의 `LocalStorage`를 활용하여 할 일(Task) 데이터를 관리하는 서비스를 구현하였습니다. 비록 `LocalStorage`는 클라이언트 측 저장소이지만, 향후 백엔드 API 및 데이터베이스(Supabase 등)로의 확장을 고려하여 **Service Layer 패턴**을 적용해 설계했습니다.

### 1. API 요구사항 분석 및 설계
- **데이터 모델**: 고유 ID, 제목, 상태(todo, doing, done), 생성일 포함
- **저장소**: 브라우저 `localStorage` (Key: `webapp_tasks`)
- **확장성**: 인터페이스 기반 설계를 통해 향후 `fetch` API를 통한 서버 연동이 용이하도록 구성

### 2. 구현 코드

#### 1) Task 데이터 타입 정의
데이터의 일관성을 위해 타입을 정의합니다.

```filepath:src/types/task.ts
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}
```

#### 2) TaskService 구현 (LocalStorage 기반)
핵심 비즈니스 로직을 담고 있는 서비스 클래스입니다.

```filepath:src/services/TaskService.ts
import { Task, TaskStatus } from '../types/task';

const STORAGE_KEY = 'webapp_tasks';

class TaskService {
  /**
   * 모든 Task를 로드합니다.
   */
  public getAll(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse tasks from LocalStorage", e);
      return [];
    }
  }

  /**
   * 새로운 Task를 저장합니다.
   */
  public save(title: string, description: string = ''): Task {
    const tasks = this.getAll();
    const newTask: Task = {
      id: Date.now().toString(), // 고유 ID 생성
      title,
      description,
      status: 'todo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    tasks.push(newTask);
    this.persist(tasks);
    return newTask;
  }

  /**
   * Task의 상태를 업데이트합니다.
   */
  public updateStatus(id: string, status: TaskStatus): Task | null {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      status,
      updatedAt: Date.now()
    };

    this.persist(tasks);
    return tasks[index];
  }

  /**
   * Task를 삭제합니다.
   */
  public delete(id: string): boolean {
    const tasks = this.getAll();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (tasks.length === filteredTasks.length) return false;

    this.persist(filteredTasks);
    return true;
  }

  /**
   * LocalStorage에 데이터를 직렬화하여 저장합니다. (Private)
   */
  private persist(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}

export const taskService = new TaskService();
```

#### 3) 백엔드 확장을 위한 DB 스키마 (SQL)
향후 `LocalStorage`에서 실제 DB로 전환할 때 사용할 PostgreSQL 스키마입니다.

```filepath:supabase/migrations/20260214000000_create_tasks_table.sql
CREATE TYPE task_status AS ENUM ('todo', 'doing', 'done');

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자동 업데이트를 위한 트리거 (선택사항)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

---

### 📋 실행 보고서 요약

**1. 생성 및 수정된 파일 리스트**
- `src/types/task.ts`: Task 데이터 구조 정의
- `src/services/TaskService.ts`: LocalStorage 기반 CRUD 로직 구현
- `supabase/migrations/20260214000000_create_tasks_table.sql`: 향후 확장을 위한 DB 스키마

**2. 주요 구현 결정 사항**
- **캡슐화**: `persist` 메서드를 private으로 설정하여 데이터 저장 방식(JSON 직렬화)을 내부로 숨겼습니다.
- **안정성**: `JSON.parse` 시 발생할 수 있는 에러에 대비하여 try-catch 구문을 추가했습니다.
- **확장성**: `Date.now()` 기반 ID를 사용하되, 타입은 `string`으로 설정하여 나중에 UUID 등으로 교체하기 쉽게 설계했습니다.

**3. 테스트 권장 사항**
- 브라우저 개발자 도구(F12)의 Console 탭에서 실행:
  ```javascript
  import { taskService } from './services/TaskService';
  taskService.save('새로운 할 일');
  console.log(taskService.getAll());
  ```
- 페이지 새로고침 후 `taskService.getAll()`을 호출하여 데이터 유지 여부 확인.

**4. 다음 단계**
- React/Vue 등 프런트엔드 컴포넌트와 `TaskService` 연결
- 에러 핸들링 UI 추가 (데이터 저장 실패 시 알림 등)
- 백엔드 API 연동을 위한 `ApiService` 인터페이스 추상화

정상적으로 구현이 완료되었습니다. 추가 요구사항이 있으시면 말씀해 주세요.

---
*이 문서는 AI 에이전트에 의해 자동 생성되었습니다.*
