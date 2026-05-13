import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from 'recharts';
import { TrendingDown, Leaf, BarChart3, Calendar } from 'lucide-react';

const monthlyWaste = [
  { month: 'Jul', waste: 580, saved: 120, cost: 11600 },
  { month: 'Aug', waste: 520, saved: 160, cost: 10400 },
  { month: 'Sep', waste: 490, saved: 180, cost: 9800 },
  { month: 'Oct', waste: 440, saved: 210, cost: 8800 },
  { month: 'Nov', waste: 380, saved: 270, cost: 7600 },
  { month: 'Dec', waste: 320, saved: 310, cost: 6400 },
  { month: 'Jan', waste: 280, saved: 360, cost: 5600 },
];

const weeklyAttendance = [
  { week: 'W1', breakfast: 320, lunch: 415, snacks: 280, dinner: 390 },
  { week: 'W2', breakfast: 335, lunch: 430, snacks: 295, dinner: 405 },
  { week: 'W3', breakfast: 310, lunch: 400, snacks: 270, dinner: 380 },
  { week: 'W4', breakfast: 345, lunch: 445, snacks: 305, dinner: 415 },
];

const dailyPattern = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  attendance: 300 + Math.round(Math.sin(i / 3) * 80 + Math.random() * 40),
  booking_rate: 70 + Math.round(Math.sin(i / 4) * 15 + Math.random() * 10),
}));

const mealWastage = [
  { meal: 'Breakfast', wastage: 8.2, trend: -15 },
  { meal: 'Lunch', wastage: 12.5, trend: -22 },
  { meal: 'Snacks', wastage: 4.1, trend: -8 },
  { meal: 'Dinner', wastage: 15.3, trend: -18 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Analytics
        </h1>
        <p className="text-gray-400 text-sm mt-1">Waste reduction & attendance insights</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Daily Waste', value: '40kg', change: '-18%', good: true },
          { label: 'Booking Rate', value: '82%', change: '+5%', good: true },
          { label: 'No-Show Rate', value: '6.4%', change: '-2.1%', good: true },
          { label: 'Monthly Savings', value: '₹18,400', change: '+22%', good: true },
        ].map(({ label, value, change, good }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
          >
            <p className="text-gray-400 text-sm mb-1">{label}</p>
            <p className="text-white text-2xl font-black">{value}</p>
            <span className={`text-xs font-medium ${good ? 'text-emerald-400' : 'text-red-400'}`}>{change} this month</span>
          </motion.div>
        ))}
      </div>

      {/* Monthly waste trend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white font-bold">Monthly Food Waste Reduction (kg)</h3>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
            <Leaf className="w-4 h-4" />
            -51% since July
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthlyWaste}>
            <defs>
              <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
            <Legend />
            <Area type="monotone" dataKey="waste" stroke="#f59e0b" fill="url(#wasteGrad)" name="Waste (kg)" strokeWidth={2} />
            <Area type="monotone" dataKey="saved" stroke="#10b981" fill="url(#savedGrad)" name="Saved (kg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly meal attendance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <h3 className="text-white font-bold mb-4">Weekly Meal Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
              <Legend />
              <Bar dataKey="breakfast" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Breakfast" />
              <Bar dataKey="lunch" fill="#10b981" radius={[3, 3, 0, 0]} name="Lunch" />
              <Bar dataKey="snacks" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Snacks" />
              <Bar dataKey="dinner" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Dinner" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily attendance line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <h3 className="text-white font-bold mb-4">30-Day Attendance Pattern</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
              <Line yAxisId="left" type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} dot={false} name="Attendance" />
              <Line yAxisId="right" type="monotone" dataKey="booking_rate" stroke="#3b82f6" strokeWidth={2} dot={false} name="Booking %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Wastage by meal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >
        <h3 className="text-white font-bold mb-4">Wastage by Meal Type (kg/day average)</h3>
        <div className="space-y-4">
          {mealWastage.map(m => (
            <div key={m.meal} className="flex items-center gap-4">
              <div className="w-24 text-gray-300 text-sm">{m.meal}</div>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.wastage / 20) * 100}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full rounded-full ${m.wastage > 10 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                />
              </div>
              <span className="text-white font-bold text-sm w-14">{m.wastage} kg</span>
              <span className="text-emerald-400 text-xs w-10">{m.trend}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Environmental impact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-bold">Environmental Impact — This Month</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'CO₂ Saved', value: '245 kg', icon: '🌱' },
            { label: 'Water Saved', value: '12,400 L', icon: '💧' },
            { label: 'Cost Saved', value: '₹18,400', icon: '💰' },
            { label: 'Meals Saved', value: '1,240', icon: '🍱' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-900/60 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">{icon}</span>
              <p className="text-emerald-400 font-bold text-lg">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
