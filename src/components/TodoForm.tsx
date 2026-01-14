import React, { useState } from 'react';

interface TodoFormProps {
  onAddTodo: (text: string) => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row gap-2 bg-white p-4 rounded-lg shadow-sm"
    >
      <div className="flex-grow flex flex-col">
        <label htmlFor="todo-input" className="mb-1 text-sm font-medium text-gray-700">
          新しいタスクを入力してください
        </label>
        <input
          id="todo-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="例：牛乳を買う"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <button
        type="submit"
        className="mt-6 sm:mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        追加
      </button>
    </form>
  );
};