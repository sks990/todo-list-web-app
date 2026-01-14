import React, { useState } from 'react';
import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import { PlusIcon } from '@heroicons/react/24/solid';

export const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue,
      completed: false,
      createdAt: new Date(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Focus Tasks</h1>
          <p className="text-slate-500 mt-2">
            {todos.length > 0 
              ? `${completedCount} / ${todos.length} tasks completed`
              : 'Manage your daily workflow efficiently.'}
          </p>
        </header>

        {/* Input Section */}
        <form onSubmit={addTodo} className="relative mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            className="w-full pl-4 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </form>

        {/* List Section */}
        <section>
          {todos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">No tasks yet. Start by adding one!</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};