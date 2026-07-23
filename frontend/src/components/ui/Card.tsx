import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'glass-card p-6',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  color = 'green',
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  change?: string;
}) {
  const colors = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <Card hover className="flex items-center gap-4">
      <div className={cn('p-3 rounded-xl border', colors[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {change && <p className="text-xs text-green-400 mt-0.5">{change}</p>}
      </div>
    </Card>
  );
}
