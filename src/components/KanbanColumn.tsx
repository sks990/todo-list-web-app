import React from 'react';
import { Task } from '../types/task';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: Task['status'];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: Task['status']) => void;
  onDragEnd: () => void;
  isDraggingOver: boolean;
  draggingTaskId: string | null;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  status,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggingOver,
  draggingTaskId,
}) => {
  const filteredTasks = tasks.filter(task => task.status === status);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      className={`w-1/3 p-4 mx-2 rounded-lg min-h-[400px] transition-colors duration-200 ${
        isDraggingOver ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-700 capitalize">{title}</h2>
      <div className="h-full min-h-[300px]">
        {filteredTasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={task.id === draggingTaskId}
          />
        ))}
         {filteredTasks.length === 0 && (
             <div className="text-center text-gray-400 py-8">No tasks here</div>
         )}
      </div>
    </div>
  );
};

export default KanbanColumn;