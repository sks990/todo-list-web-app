import React from 'react';
import { Task } from '../types/task';

interface KanbanCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onDragStart, onDragEnd, isDragging }) => {
  const getPriorityColor = (priority: Task['priority']): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`bg-white p-4 mb-2 rounded shadow cursor-grab transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      } `}
    >
      <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
      <div className={`w-16 h-2 mt-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
      <span className="text-sm text-gray-500 capitalize">{task.priority}</span>
    </div>
  );
};

export default KanbanCard;