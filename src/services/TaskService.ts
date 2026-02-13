import { Task, TaskStatus } from '../types/task';

const STORAGE_KEY = 'kanban_tasks';

export const TaskService = {
  // 모든 태스크 가져오기
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // 초기 데이터 셋업
      const initialTasks: Task[] = [
        { id: '1', title: '프로젝트 기획하기', description: '요구사항 정의 및 분석', status: 'TODO', createdAt: Date.now() },
        { id: '2', title: 'UI 컴포넌트 개발', description: 'Tailwind를 이용한 버튼 구현', status: 'IN_PROGRESS', createdAt: Date.now() },
      ];
      TaskService.saveTasks(initialTasks);
      return initialTasks;
    }
    return JSON.parse(data);
  },

  // 태스크 상태 업데이트
  updateStatus: (taskId: string, newStatus: TaskStatus): Task[] => {
    const tasks = TaskService.getTasks();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    TaskService.saveTasks(updatedTasks);
    return updatedTasks;
  },

  // 로컬 스토리지 저장
  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },
};
