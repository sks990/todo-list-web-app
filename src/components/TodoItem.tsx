import React from 'react';
import { Todo } from '../types/todo';
import { Trash2, CheckCircle, Circle } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group">
      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onToggle(todo.id)}>
        <button 
          aria-label={todo.completed ? "Task completed" : "Mark as completed"}
          className="text-blue-500 focus:outline-none"
        >
          {todo.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6 text-gray-300" />}
        </button>
        <span className={`text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-400 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};