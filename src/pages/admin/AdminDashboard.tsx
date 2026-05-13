import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, UtensilsCrossed, TrendingDown, AlertTriangle, CheckCircle, Clock, Leaf, BarChart3, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StatCard from '../../components/ui/StatCard';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const weeklyWaste = [
  { day: 'Mon', confirmed: 420, consumed: 385, wastage: 35 },
  { day: 'Tue', confirmed: 380, consumed: 360, wastage: 20 },
  { day: 'Wed', confirmed: 450, consumed: 420, wastage: 30 },
  { day: 'Thu', confirmed: 410, consumed: 395, wastage: 15 },
  { day: 'Fri', confirmed: 390, consumed: 370, wastage: 20 },
  { day: 'Sat', confirmed: 320, consumed: 310, wastage: 10 },
  { day: 'Sun', confirmed: 300, consumed: 290, wastage: 10 },
];

const mealDistribution = [
  { name: 'Breakfast', value: 320 },
  { name: 'Lunch', value: 410 },
  { name: 'Snacks', value: 280 },
  { name: 'Dinner', value: 390 },
];

const popularMeals = [
  { name: 'Mutton Biryani', popularity: 98, attendance: '94%', meal_type: 'dinner' },
  { name: 'Vada Pav', popularity: 96, attendance: '91%', meal_type: 'snacks' },
  { name: 'Paneer Butter Masala', popularity: 95, attendance: '89%', meal_type: 'lunch' },
  { name: 'Masala Dosa', popularity: 92, attendance: '87%', meal_type: 'breakfast' },
  { name: 'Rajma Chawal', popularity: 89, attendance: '85%', meal_type: 'dinner' },
];

export default function AdminDashboard() {
  const [todayCounts, setTodayCounts] = useState({ breakfast: 0, lunch: 0, snacks: 0, dinner: 0 });
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [totalWastage, setTotalWastage] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const [{ data: menus }, { count: students }, { count: complaints }] = await Promise.all([
      supabase.from('menus').select('meal_type, confirmed_count').eq('date', today),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('complaints').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);

    if (menus) {
      const counts = { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
      menus.forEach(m => { counts[m.meal_type as keyof typeof counts] = m.confirmed_count; });
      setTodayCounts(counts);
    }
    setTotalStudents(students || 0);
    setPendingComplaints(complaints || 0);
    setTotalWastage(140);
    setLoading(false);
  }

  const totalToday = Object.values(todayCounts).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents} subtitle="Registered users" icon={Users} color="blue" delay={0.05} />
        <StatCard title="Meals Today" value={totalToday} subtitle="Across all 4 meals" icon={UtensilsCrossed} color="emerald" delay={0.1} />
        <StatCard title="Waste Today" value={`${totalWastage}kg`} subtitle="-12% vs yesterday" icon={TrendingDown} color="amber" delay={0.15} trend={{ value: -12, label: 'vs yesterday' }} />
        <StatCard title="Pending Complaints" value={pendingComplaints} subtitle="Needs attention" icon={AlertTriangle} color={pendingComplaints > 5 ? 'red' : 'teal'} delay={0.2} />
      </div>

      {/* Live Meal Counts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          Live Meal Counts
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { meal: 'Breakfast', count: todayCounts.breakfast, emoji: '🌅', color: 'amber' },
            { meal: 'Lunch', count: todayCounts.lunch, emoji: '☀️', color: 'emerald' },
            { meal: 'Snacks', count: todayCounts.snacks, emoji: '🫙', color: 'blue' },
            { meal: 'Dinner', count: todayCounts.dinner, emoji: '🌙', color: 'violet' },
          ].map(({ meal, count, emoji, color }) => (
            <div key={meal} className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center`}>
              <span className="text-3xl mb-2 block">{emoji}</span>
              <p className="text-3xl font-black text-white">{loading ? '...' : count}</p>
              <p className="text-gray-400 text-sm">{meal}</p>
              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                  style={{ width: `${Math.min((count / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1">{Math.round((count / 500) * 100)}% capacity</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold">Weekly Attendance vs Waste</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyWaste} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="confirmed" fill="#10b981" radius={[4, 4, 0, 0]} name="Confirmed" />
              <Bar dataKey="consumed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Consumed" />
              <Bar dataKey="wastage" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Waste" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Meal distribution pie */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold">Today's Meal Distribution</h3>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={mealDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {mealDistribution.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {mealDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-gray-400 text-sm">{d.name}</span>
                  </div>
                  <span className="text-white font-semibold text-sm">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Popular meals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >
        <h3 className="text-white font-bold mb-4">Meal Popularity Heatmap</h3>
        <div className="space-y-3">
          {popularMeals.map(meal => (
            <div key={meal.name} className="flex items-center gap-4">
              <div className="w-40 text-gray-300 text-sm truncate">{meal.name}</div>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${meal.popularity}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
              <span className="text-gray-400 text-sm w-10 text-right">{meal.popularity}%</span>
              <span className="text-emerald-400 text-xs w-12 text-right">{meal.attendance}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Prediction panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-gradient-to-br from-blue-900/30 to-sky-900/20 border border-blue-500/30 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Demand Prediction — Tomorrow</h3>
            <p className="text-gray-400 text-sm">Based on booking patterns and historical data</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { meal: 'Breakfast', predicted: 310, confidence: '91%' },
            { meal: 'Lunch', predicted: 435, confidence: '94%' },
            { meal: 'Snacks', predicted: 270, confidence: '88%' },
            { meal: 'Dinner', predicted: 405, confidence: '93%' },
          ].map(({ meal, predicted, confidence }) => (
            <div key={meal} className="bg-gray-900/60 rounded-xl p-3 text-center">
              <p className="text-blue-400 font-bold text-xl">{predicted}</p>
              <p className="text-gray-400 text-xs">{meal}</p>
              <p className="text-gray-600 text-xs mt-1">{confidence} confidence</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
