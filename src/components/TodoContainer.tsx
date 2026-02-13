[codeimport React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';
import { PlusCircle } from 'lucide-react';

export const TodoContainer: React.FC = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>('my-app-todos', []);
  const [inputValue, setInputValue] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg min-h-[500px] flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
        <p className="text-gray-500 text-sm">
          {todos.length > 0 
            ? `${completedCount} of ${todos.length} tasks completed`
            : "새로운 할 일을 추가해보세요!"}
        </p>
      </header>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="할 일을 입력하세요..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
          aria-label="Add task"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto">
        {todos.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            목록이 비어 있습니다.
          </div>
        ) : (
          todos
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            ))
        )}
      </div>
    </div>
  );
};