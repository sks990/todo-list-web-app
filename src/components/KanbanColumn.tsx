[code;think
import React, { useState } from 'react';
import { Task, TaskStatus, STATUS_LABELS } from '../types/task';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onDrop: (taskId: string, targetStatus: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDrop }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    
    // 드래그 이미지 투명도 조절 (ghost effect 스타일링을 위해 약간의 딜레이 사용 가능)
    const target = e.target as HTMLElement;
    target.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-full min-h-[500px] rounded-xl p-4 transition-all duration-300 ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          {STATUS_LABELS[status]}
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto" onDragEnd={handleDragEnd}>
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} />
        ))}
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
            여기에 드롭하세요
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;