import React from 'react';
import { Todo } from '../types/todo';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:shadow-md hover:border-blue-200 mb-3 animate-fadeIn">
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-slate-300 hover:border-blue-400'
          }`}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <CheckIcon className="w-4 h-4 text-white" />}
        </button>
        <span
          className={`text-sm sm:text-base transition-all duration-300 ${
            todo.completed ? 'line-through text-slate-400' : 'text-slate-700'
          }`}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Delete task"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};