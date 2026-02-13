import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CheckSquare, BarChart2 } from 'lucide-react';

// Types
type ViewType = 'Todo' | 'Kanban' | 'Gantt';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('Todo');

  const navItems = [
    { id: 'Todo', icon: <CheckSquare size={20} />, label: 'Todo' },
    { id: 'Kanban', icon: <LayoutGrid size={20} />, label: 'Kanban' },
    { id: 'Gantt', icon: <BarChart2 size={20} />, label: 'Gantt' },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 md:p-8 font-sans">
      {/* Main Glassmorphism Container */}
      <div className="w-full max-w-6xl h-[85vh] bg-white bg-opacity-20 backdrop-blur-xl border border-white border-opacity-30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between px-8 py-6 border-b border-white border-opacity-20">
          <h1 className="text-2xl font-bold text-white tracking-tight">SFA Framework</h1>
          <nav className="flex space-x-2 bg-black bg-opacity-10 p-1 rounded-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeView === item.id 
                    ? 'bg-white bg-opacity-30 text-white shadow-sm' 
                    : 'text-white text-opacity-60 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              {activeView === 'Todo' && <TodoPlaceholder />}
              {activeView === 'Kanban' && <KanbanPlaceholder />}
              {activeView === 'Gantt' && <GanttPlaceholder />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Placeholder Components (To be developed in future tasks)
const TodoPlaceholder = () => (
  <div className="space-y-4">
    <h2 className="text-3xl font-bold text-white mb-6">Task List</h2>
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white bg-opacity-10 p-4 rounded-2xl border border-white border-opacity-10 text-white hover:bg-opacity-20 transition-all cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className="w-6 h-6 border-2 border-white border-opacity-50 rounded-md"></div>
          <span className="text-lg">Sample Todo Task #{i}</span>
        </div>
      </div>
    ))}
  </div>
);

const KanbanPlaceholder = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
    {['To Do', 'In Progress', 'Done'].map((col) => (
      <div key={col} className="bg-white bg-opacity-10 rounded-2xl p-4 flex flex-col border border-white border-opacity-10">
        <h3 className="text-white font-semibold mb-4 opacity-80">{col}</h3>
        <div className="flex-1 space-y-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl shadow-sm text-sm text-white">Example Card</div>
        </div>
      </div>
    ))}
  </div>
);

const GanttPlaceholder = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="text-5xl mb-4">📊</div>
      <p className="text-white text-opacity-80">Gantt Chart View will be implemented here.</p>
    </div>
  </div>
);

export default App;