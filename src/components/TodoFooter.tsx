import React from 'react';

export const TodoFooter: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 p-6 mt-12">
      <div className="container mx-auto text-center text-sm text-gray-600">
        <p>© 2024 TODO App - Built with Accessibility in mind</p>
        <p className="mt-2">
          このアプリはシマンティックHTML5とTailwind CSSを使用して構築されています。
        </p>
      </div>
    </footer>
  );
};