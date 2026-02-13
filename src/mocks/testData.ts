import { Task } from '../types'; // 실제 타입 경로에 맞춰 조정

export const mockTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
  id: `task-${i}`,
  title: `Performance Test Task ${i}`,
  status: i % 3 === 0 ? 'TODO' : i % 3 === 1 ? 'IN_PROGRESS' : 'DONE',
  priority: 'medium',
  startDate: '2023-10-01',
  endDate: '2023-10-05',
  description: `Description for task ${i}`,
  assignee: 'QA Agent'
}));

export const singleTask: Task = {
  id: 'task-unique-123',
  title: 'Integration Flow Task',
  status: 'TODO',
  priority: 'high',
  startDate: '2023-10-10',
  endDate: '2023-10-12',
  description: 'Testing the full flow',
};