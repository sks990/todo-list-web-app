import React from 'react';
import { Task } from '../types/task';

interface KanbanCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors duration-200 group"
    >
      <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
        {task.title}
      </h4>
      <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
      <div className="mt-3 flex justify-end">
        <span className="text-[10px] text-gray-400">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;