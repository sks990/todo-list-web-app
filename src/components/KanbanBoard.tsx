import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskService } from '../services/TaskService';
import KanbanColumn from './KanbanColumn';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  useEffect(() => {
    setTasks(TaskService.getTasks());
  }, []);

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = TaskService.updateStatus(taskId, newStatus);
    setTasks(updatedTasks);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
        <p className="text-gray-500 mt-2">드래그 앤 드롭으로 작업의 상태를 관리하세요.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;