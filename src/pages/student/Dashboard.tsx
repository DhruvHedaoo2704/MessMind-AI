import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wallet, AlertTriangle, Leaf, Clock, Zap, TrendingUp, ChefHat, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, Menu, Meal, MealBooking, CREDIT_VALUES } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import StatCard from '../../components/ui/StatCard';
import MealCard from '../../components/ui/MealCard';

interface MenuWithMeals extends Menu { meals: Meal[] }

export default function StudentDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [menus, setMenus] = useState<MenuWithMeals[]>([]);
  const [bookings, setBookings] = useState<Record<string, MealBooking>>({});
  const [wallet, setWallet] = useState({ balance: 0, emergency_credits: 0, streak_days: 0 });
  const [penalties, setPenalties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [savedMeals, setSavedMeals] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadMenus(), loadWallet(), loadPenalties(), loadStats()]);
    setLoading(false);
  }

  async function loadMenus() {
    const { data: menuData } = await supabase
      .from('menus')
      .select('*')
      .eq('date', today)
      .order('meal_type');

    if (!menuData) return;

    const menusWithMeals: MenuWithMeals[] = [];
    for (const menu of menuData) {
      const { data: mmData } = await supabase
        .from('menu_meals')
        .select('meal_id')
        .eq('menu_id', menu.id);

      const mealIds = mmData?.map(m => m.meal_id) || [];
      let meals: Meal[] = [];
      if (mealIds.length > 0) {
        const { data: mealData } = await supabase
          .from('meals')
          .select('*')
          .in('id', mealIds);
        meals = mealData || [];
      }
      menusWithMeals.push({ ...menu, meals });
    }
    setMenus(menusWithMeals);

    if (profile && menuData.length > 0) {
      const { data: bookingData } = await supabase
        .from('meal_bookings')
        .select('*')
        .eq('user_id', profile.id)
        .in('menu_id', menuData.map(m => m.id));

      const bookingMap: Record<string, MealBooking> = {};
      bookingData?.forEach(b => { bookingMap[b.menu_id] = b; });
      setBookings(bookingMap);
    }
  }

  async function loadWallet() {
    if (!profile) return;
    const { data } = await supabase.from('wallets').select('*').eq('user_id', profile.id).maybeSingle();
    if (data) setWallet({ balance: data.balance, emergency_credits: data.emergency_credits, streak_days: data.streak_days });
  }

  async function loadPenalties() {
    if (!profile) return;
    const now = new Date();
    const { count } = await supabase
      .from('penalty_records')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear());
    setPenalties(count || 0);
  }

  async function loadStats() {
    if (!profile) return;
    const { count } = await supabase
      .from('meal_bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('status', 'cancelled');
    setSavedMeals(count || 0);
  }

  async function handleBook(menuId: string) {
    if (!profile) return;
    setBookingLoading(true);
    const qrCode = `MM-${profile.id.slice(0, 8)}-${menuId.slice(0, 8)}-${Date.now()}`;
    const { data, error } = await supabase
      .from('meal_bookings')
      .insert({ user_id: profile.id, menu_id: menuId, status: 'confirmed', qr_code: qrCode })
      .select()
      .single();
    if (error) {
      toast('error', 'Booking failed', error.message);
    } else {
      setBookings(prev => ({ ...prev, [menuId]: data }));
      // increment confirmed count (best-effort, no return needed)
      const { data: mn } = await supabase.from('menus').select('confirmed_count').eq('id', menuId).maybeSingle();
      if (mn) await supabase.from('menus').update({ confirmed_count: mn.confirmed_count + 1 }).eq('id', menuId);
      toast('success', 'Meal booked!', 'Your QR code is ready.');
    }
    setBookingLoading(false);
  }

  async function handleCancel(bookingId: string, menuId: string) {
    if (!profile) return;
    setBookingLoading(true);
    const menu = menus.find(m => m.id === menuId);
    const credits = menu ? CREDIT_VALUES[menu.meal_type] : 0;

    const { error } = await supabase
      .from('meal_bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (!error) {
      const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', profile.id).maybeSingle();
      const newBalance = (w?.balance || 0) + credits;
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', profile.id);
      await supabase.from('wallet_transactions').insert({
        user_id: profile.id, type: 'credit', amount: credits,
        reason: `Cancelled ${menu?.meal_type} meal`, balance_after: newBalance,
      });
      setBookings(prev => ({ ...prev, [menuId]: { ...prev[menuId], status: 'cancelled' } }));
      setWallet(prev => ({ ...prev, balance: newBalance }));
      toast('success', `+${credits} credits earned!`, `Meal cancelled. Credits added to wallet.`);
    } else {
      toast('error', 'Cancellation failed');
    }
    setBookingLoading(false);
  }

  const mealOrder = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const sortedMenus = [...menus].sort((a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type));

  const bookedCount = Object.values(bookings).filter(b => b.status === 'confirmed').length;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            {greeting()}, <span className="text-emerald-400">{profile?.full_name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/meals" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <ChefHat className="w-4 h-4" />
          Book Meals
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Meal Credits" value={wallet.balance} subtitle="Available to spend" icon={Wallet} color="emerald" delay={0.05} />
        <StatCard title="Emergency Credits" value={wallet.emergency_credits} subtitle="Remaining this month" icon={Zap} color="amber" delay={0.1} />
        <StatCard title="Meals Booked Today" value={bookedCount} subtitle={`Out of ${menus.length} meals`} icon={Star} color="blue" delay={0.15} />
        <StatCard title="No-Shows This Month" value={penalties} subtitle={penalties >= 5 ? 'Warning: Limit reached!' : `${5 - penalties} left before penalty`} icon={AlertTriangle} color={penalties >= 4 ? 'red' : 'teal'} delay={0.2} />
      </div>

      {/* Sustainability */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Your Sustainability Impact</p>
              <p className="text-gray-400 text-sm">You've helped prevent food waste</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-400">{savedMeals}</p>
              <p className="text-gray-500 text-xs">Meals Saved</p>
            </div>
            <div>
              <p className="text-2xl font-black text-teal-400">{(savedMeals * 0.35).toFixed(1)}kg</p>
              <p className="text-gray-500 text-xs">Food Saved</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-400">{wallet.streak_days}</p>
              <p className="text-gray-500 text-xs">Day Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Meals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Today's Menu
          </h2>
          <Link to="/meals" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedMenus.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No menus available for today</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {sortedMenus.map(menu => (
              <MealCard
                key={menu.id}
                menu={menu}
                meals={menu.meals}
                booking={bookings[menu.id]}
                onBook={handleBook}
                onCancel={handleCancel}
                loading={bookingLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/wallet', icon: Wallet, label: 'View Wallet', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { to: '/canteen', icon: TrendingUp, label: 'Order Canteen', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { to: '/complaints', icon: AlertTriangle, label: 'File Complaint', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { to: '/history', icon: Star, label: 'View History', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] ${color}`}>
            <Icon className="w-5 h-5" />
            <span className="font-medium text-white text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
