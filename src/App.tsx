import React from 'react';
import { TodoContainer } from './components/TodoContainer';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-200 py-12 px-4">
      <TodoContainer />
      <footer className="mt-8 text-center text-gray-500 text-xs">
        Data is persisted in your browser's LocalStorage.
      </footer>
    </div>
  );
};

export default App;