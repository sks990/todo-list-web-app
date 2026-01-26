import React from 'react';
import { motion } from 'framer-motion';
import { FeatureCardProps } from '../../types/ui';

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="p-8 transition-all bg-white border border-slate-100 rounded-3xl group hover:shadow-2xl hover:shadow-slate-200/50"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-6 transition-colors bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-4 text-xl font-bold text-slate-900">{title}</h3>
      <p className="leading-relaxed text-slate-500">
        {description}
      </p>
    </motion.div>
  );
};