import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, X, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MealBooking } from '../../lib/supabase';

interface BookingWithMenu extends MealBooking {
  menu?: { date: string; meal_type: string; serving_time: string };
}

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Check },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: X },
  consumed: { label: 'Consumed', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Check },
  no_show: { label: 'No Show', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
};

const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', snacks: '🫙', dinner: '🌙' };

export default function History() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<BookingWithMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (profile) loadHistory();
  }, [profile]);

  async function loadHistory() {
    setLoading(true);
    const { data } = await supabase
      .from('meal_bookings')
      .select('*, menu:menu_id(date, meal_type, serving_time)')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setBookings((data as BookingWithMenu[]) || []);
    setLoading(false);
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    consumed: bookings.filter(b => b.status === 'consumed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    no_show: bookings.filter(b => b.status === 'no_show').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Booking History</h1>
        <p className="text-gray-400 text-sm mt-1">Your complete meal booking record</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, color: 'text-white' },
          { label: 'Meals Consumed', value: stats.consumed, color: 'text-blue-400' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-emerald-400' },
          { label: 'No-Shows', value: stats.no_show, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'confirmed', 'cancelled', 'consumed', 'no_show'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-gray-800/50 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b, i) => {
            const sc = statusConfig[b.status];
            const Icon = sc.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4"
              >
                <div className="text-2xl">{mealEmoji[b.menu?.meal_type || 'breakfast']}</div>
                <div className="flex-1">
                  <p className="text-white font-semibold capitalize">{b.menu?.meal_type || 'Meal'}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.menu?.date ? new Date(b.menu.date + 'T00:00:00').toLocaleDateString('en-IN') : 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.menu?.serving_time || 'N/A'}</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${sc.color}`}>
                  <Icon className="w-3 h-3" />
                  {sc.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
