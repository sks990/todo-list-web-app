import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden bg-white">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -20, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-indigo-50 text-indigo-600 rounded-full">
            The New Standard of Excellence
          </span>
          <h1 className="mb-8 text-6xl font-extrabold leading-tight tracking-tight md:text-8xl text-slate-900">
            Crafting Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Masterpieces
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg leading-relaxed text-slate-500 md:text-xl">
            우리는 단순한 웹사이트를 넘어, 브랜드의 가치를 예술적 경험으로 승화시킵니다. 
            최첨단 기술과 감각적인 디자인의 완벽한 조화를 만나보세요.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6"
        >
          <button className="group flex items-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-2xl transition-all hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200">
            프로젝트 시작하기
            <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
          </button>
          <button className="px-8 py-4 text-lg font-bold transition-all border-2 border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50">
            포트폴리오 보기
          </button>
        </motion.div>
      </div>
    </section>
  );
};