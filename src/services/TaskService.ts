import { Task } from '../types/task';

const LOCAL_STORAGE_KEY = 'kanbanTasks';

export const TaskService = {
  getTasks: (): Task[] => {
    const tasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!tasksJson) {
      // 초기 데이터 예시
      return [
        { id: 'task-1', title: 'Implement Kanban Board UI', priority: 'high', status: 'todo' },
        { id: 'task-2', title: 'Design Drag and Drop Logic', priority: 'medium', status: 'todo' },
        { id: 'task-3', title: 'Refactor Card Component', priority: 'low', status: 'inProgress' },
        { id: 'task-4', title: 'Write Unit Tests', priority: 'medium', status: 'done' },
      ];
    }
    return JSON.parse(tasksJson);
  },

  updateStatus: (taskId: string, newStatus: Task['status']): void => {
    const tasks = TaskService.getTasks();
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTasks));
  },

  updateTasks: (tasks: Task[]): void => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }
};