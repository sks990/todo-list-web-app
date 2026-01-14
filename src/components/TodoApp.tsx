import React, { useState } from 'react';
import { TodoHeader } from './TodoHeader';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoFooter } from './TodoFooter';

export const TodoApp: React.FC = () => {
  // 状態管理は後のタスクで拡張可能ですが、基本構造のために定義
  const [todos, setTodos] = useState<{ id: string; text: string }[]>([]);

  const addTodo = (text: string) => {
    const newTodo = { id: crypto.randomUUID(), text };
    setTodos([...todos, newTodo]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* シマンティックなヘッダー */}
      <TodoHeader />

      {/* メインコンテンツエリア */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        <section aria-labelledby="todo-form-heading" className="mb-8">
          <h2 id="todo-form-heading" className="sr-only">新規タスク追加</h2>
          <TodoForm onAddTodo={addTodo} />
        </section>

        <section aria-labelledby="todo-list-heading">
          <h2 id="todo-list-heading" className="text-xl font-semibold mb-4">タスク一覧</h2>
          <TodoList todos={todos} />
        </section>
      </main>

      {/* シマンティックなフッター */}
      <TodoFooter />
    </div>
  );
};