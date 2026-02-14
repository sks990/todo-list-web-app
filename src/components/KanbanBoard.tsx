import React, { useState, useEffect, useCallback } from 'react';
import KanbanColumn from './KanbanColumn';
import { Task } from '../types/task';
import { TaskService } from '../services/TaskService';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [draggingOverStatus, setDraggingOverStatus] = useState<Task['status'] | null>(null);

  useEffect(() => {
    setTasks(TaskService.getTasks());
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId); // Firefox 호환성
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null);
    setDraggingOverStatus(null); // 드래그 종료 시 하이라이트 제거
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // 기본 동작 방지 (drop 허용)
    // 드래그 중인 컬럼 상태 추적
    const targetColumn = e.currentTarget.closest('.column-drop-zone');
    if (targetColumn) {
      const status = targetColumn.getAttribute('data-status') as Task['status'];
      setDraggingOverStatus(status);
    }
    e.dataTransfer.dropEffect = 'move';
  }, []);

   const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const status = e.currentTarget.getAttribute('data-status') as Task['status'];
      setDraggingOverStatus(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      const targetColumn = e.currentTarget.closest('.column-drop-zone');
      if (targetColumn && !targetColumn.contains(e.relatedTarget as Node)) {
           setDraggingOverStatus(null);
      }
  }, []);


  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && draggingTaskId && targetStatus) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: targetStatus } : task
        )
      );
      TaskService.updateStatus(taskId, targetStatus);
    }
    setDraggingTaskId(null);
    setDraggingOverStatus(null);
  }, [draggingTaskId]);


  const columns = ['todo', 'inProgress', 'done'] as const;

  return (
    <div className="flex justify-center items-start p-8 bg-gray-100 min-h-screen space-x-4 overflow-x-auto">
      {columns.map((status) => (
        <div
            key={status}
            className="column-drop-zone" // 드롭 영역 식별을 위한 클래스
            data-status={status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
            onDragEnter={(e) => handleDragEnter(e)}
            onDragLeave={(e) => handleDragLeave(e)}
        >
            <KanbanColumn
                title={status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                tasks={tasks}
                status={status}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver} // Column 컴포넌트에서도 onDragOver 처리
                onDrop={handleDrop} // Column 컴포넌트에서도 onDrop 처리
                isDraggingOver={draggingOverStatus === status}
                draggingTaskId={draggingTaskId}
            />
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;