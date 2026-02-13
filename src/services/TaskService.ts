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