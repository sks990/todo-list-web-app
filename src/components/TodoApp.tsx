import React, { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';

const TodoApp: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTodo(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Todo List</h1>
          
          <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="何をする？"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              disabled={!inputValue.trim()}
            >
              追 加
            </button>
          </form>

          <div className="border rounded-lg overflow-hidden bg-white">
            {todos.length === 0 ? (
              <p className="p-8 text-center text-gray-500 italic">タスクがありません</p>
            ) : (
              <ul>
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </ul>
            )}
          </div>

          {todos.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 flex justify-between">
              <span>全 {todos.length} 件</span>
              <span>完了済み: {todos.filter(t => t.isCompleted).length} 件</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;