import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  );
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

  return (
    <motion.nav
      style={{ backgroundColor, backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-all duration-300 border-b border-transparent hover:border-slate-200/50"
    >
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold tracking-tighter text-slate-900"
      >
        PRESTIGE<span className="text-indigo-600">.</span>
      </motion.div>
      
      <div className="hidden space-x-8 md:flex">
        {['Solution', 'Philosophy', 'Showcase', 'Contact'].map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-sm font-medium transition-colors text-slate-600 hover:text-indigo-600"
          >
            {item}
          </motion.a>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2 text-sm font-semibold text-white transition-shadow bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 hover:shadow-indigo-400"
      >
        Get Started
      </motion.button>
    </motion.nav>
  );
};