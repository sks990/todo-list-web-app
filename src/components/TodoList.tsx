import React from 'react';

interface TodoListProps {
  todos: { id: string; text: string }[];
}

export const TodoList: React.FC<TodoListProps> = ({ todos }) => {
  if (todos.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-gray-500">タスクがありません。新しいタスクを追加しましょう！</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <li 
          key={todo.id}
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-hover hover:shadow-md"
        >
          {/* 今後のタスクでチェックボックスや削除ボタンを追加 */}
          <span className="text-gray-800">{todo.text}</span>
        </li>
      ))}
    </ul>
  );
};