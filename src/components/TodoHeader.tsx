import React from 'react';

export const TodoHeader: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md p-6">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Accessible TODO App
        </h1>
      </div>
    </header>
  );
};