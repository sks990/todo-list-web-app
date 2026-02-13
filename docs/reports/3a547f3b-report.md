# 작업 보고서: LocalStorage 기반 Task 관리 엔진(Service) 구현

## 메타데이터
- **태스크 ID**: 3a547f3b-9362-4e68-b6d3-ee40e8f82130
- **타입**: feature
- **우선순위**: critical
- **담당 에이전트**: Backend
- **완료 시간**: 2026-02-13T18:52:36.483Z

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

## 작업 내용
안녕하세요. Backend Developer AI Agent입니다. 
브라우저의 `LocalStorage`를 활용하여 할 일(Task) 데이터를 관리하는 `TaskService`를 구현하였습니다. 이 서비스는 백엔드 없이 클라이언트 측 영구 저장을 지원하며, 향후 서버 API로의 확장을 고려한 인터페이스 구조를 가집니다.

### 1. Task 데이터 타입 및 인터페이스 정의

```typescript:src/services/task/types.ts
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ITaskService {
  getAll(): Task[];
  save(title: string, description?: string): Task;
  updateStatus(id: string, status: TaskStatus): Task | null;
  delete(id: string): boolean;
}
```

### 2. TaskService 구현 (LocalStorage 기반)

```typescript:src/services/task/TaskService.ts
import { Task, TaskStatus, ITaskService } from './types';

class TaskService implements ITaskService {
  private readonly STORAGE_KEY = 'webapp_tasks';

  /**
   * LocalStorage에서 전체 데이터를 로드하고 JSON 역직렬화합니다.
   */
  public getAll(): Task[] {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return [];
    try {
      return JSON.parse(rawData) as Task[];
    } catch (e) {
      console.error("Failed to parse tasks from LocalStorage", e);
      return [];
    }
  }

  /**
   * 데이터를 JSON 직렬화하여 LocalStorage에 저장합니다.
   */
  private saveToStorage(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  /**
   * 새 작업을 추가합니다. 고유 ID는 Date.now()를 기반으로 생성합니다.
   */
  public save(title: string, description: string = ''): Task {
    const tasks = this.getAll();
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title,
      description,
      status: 'todo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    tasks.push(newTask);
    this.saveToStorage(tasks);
    return newTask;
  }

  /**
   * 특정 작업의 상태를 변경합니다.
   */
  public updateStatus(id: string, status: TaskStatus): Task | null {
    const tasks = this.getAll();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) return null;

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      status,
      updatedAt: Date.now()
    };

    this.saveToStorage(tasks);
    return tasks[taskIndex];
  }

  /**
   * 특정 작업을 삭제합니다.
   */
  public delete(id: string): boolean {
    const tasks = this.getAll();
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (tasks.length === filteredTasks.length) return false;

    this.saveToStorage(filteredTasks);
    return true;
  }
}

// 싱글톤 인스턴스로 수출
export const taskService = new TaskService();
```

---

### 작업 요약 및 보고

#### 1. 생성된 파일 목록
- `src/services/task/types.ts`: Task 데이터 구조 및 타입 정의
- `src/services/task/TaskService.ts`: LocalStorage 기반 CRUD 로직 구현 및 싱글톤 객체 수출

#### 2. 주요 구현 결정 사항
- **ID 생성**: `Date.now()` 기반의 문자열 ID(`task_timestamp`)를 사용하여 고유성을 확보했습니다.
- **Error Handling**: `JSON.parse` 시 발생할 수 있는 잠재적 파싱 에러를 `try-catch`로 처리하여 애플리케이션 충돌을 방지했습니다.
- **확장성**: `ITaskService` 인터페이스를 정의함으로써, 추후 LocalStorage 대신 Supabase나 REST API를 사용하는 버전으로 교체하기 용이하도록 설계했습니다.

#### 3. 테스트 권장 방법
- **영속성 테스트**: `taskService.save("테스트 할 일")` 호출 후 브라우저를 새로고침하고 `taskService.getAll()`을 실행하여 데이터가 상주하는지 확인하십시오.
- **콘솔 테스트**:
  ```javascript
  import { taskService } from './src/services/task/TaskService';
  taskService.save("코드 리뷰", "LocalStorage 로직 확인");
  console.log(taskService.getAll());
  ```

#### 4. 향후 계획
- Task의 제목(title) 수정 기능 추가
- 마감 기한(dueDate) 및 우선순위(priority) 필드 확장
- 현재는 Backend 연동 전 단계이므로 데이터 동기화 이슈가 없으나, 추후 서버 도입 시 API 연동 작업을 진행할 예정입니다.

PM님, Task 관리 엔진의 핵심 로직 구현이 완료되었습니다. 검토 부탁드립니다.

## 다음 단계
- [ ] PM 리뷰 대기
- [ ] 코드 리뷰 진행
- [ ] 테스트 검증
- [ ] 배포 승인

---
*이 보고서는 AI 에이전트에 의해 자동 생성되었습니다.*
