import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'teal' | 'rose';
  trend?: { value: number; label: string };
  delay?: number;
}

const colorMap = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
};

const iconBg = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  teal: 'bg-teal-500/20 text-teal-400',
  rose: 'bg-rose-500/20 text-rose-400',
};

export default function StatCard({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5 overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-current" />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.value >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}
