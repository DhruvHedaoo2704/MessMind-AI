import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, QrCode, Flame, Leaf, AlertCircle, Check, X, Clock, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, Menu, Meal, MealBooking1, CREDIT_VALUES } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';

interface MenuWithMeals extends Menu { meals: Meal[] }

export default function MealBooking() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [menus, setMenus] = useState<MenuWithMeals[]>([]);
  const [bookings, setBookings] = useState<Record<string, MealBooking1>>({});
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MenuWithMeals | null>(null);

  useEffect(() => {
    if (profile) loadData();
  }, [profile, selectedDate]);

  async function loadData() {
    setLoading(true);
    const { data: menuData } = await supabase
      .from('menus').select('*').eq('date', selectedDate).order('meal_type');

    if (!menuData) { setLoading(false); return; }

    const withMeals: MenuWithMeals[] = [];
    for (const menu of menuData) {
      const { data: mm } = await supabase.from('menu_meals').select('meal_id').eq('menu_id', menu.id);
      const ids = mm?.map(x => x.meal_id) || [];
      let meals: Meal[] = [];
      if (ids.length) {
        const { data: mData } = await supabase.from('meals').select('*').in('id', ids);
        meals = mData || [];
      }
      withMeals.push({ ...menu, meals });
    }
    setMenus(withMeals);

    if (menuData.length && profile) {
      const { data: bData } = await supabase.from('meal_bookings').select('*')
        .eq('user_id', profile.id).in('menu_id', menuData.map(m => m.id));
      const map: Record<string, MealBooking> = {};
      bData?.forEach(b => { map[b.menu_id] = b; });
      setBookings(map);
    }
    setLoading(false);
  }

  async function handleBook(menuId: string) {
    if (!profile) return;
    setBookingLoading(menuId);
    const qr = `MM-${profile.id.slice(0, 8)}-${menuId.slice(0, 8)}-${Date.now()}`;
    const { data, error } = await supabase.from('meal_bookings')
      .insert({ user_id: profile.id, menu_id: menuId, status: 'confirmed', qr_code: qr })
      .select().single();
    if (error) toast('error', 'Booking failed');
    else {
      setBookings(p => ({ ...p, [menuId]: data }));
      toast('success', 'Meal confirmed!', 'QR code generated.');
    }
    setBookingLoading(null);
  }

  async function handleCancel(bookingId: string, menuId: string) {
    if (!profile) return;
    setBookingLoading(menuId);
    const menu = menus.find(m => m.id === menuId);
    const credits = menu ? CREDIT_VALUES[menu.meal_type] : 0;
    const { error } = await supabase.from('meal_bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', bookingId);
    if (!error) {
      const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', profile.id).maybeSingle();
      const nb = (w?.balance || 0) + credits;
      await supabase.from('wallets').update({ balance: nb }).eq('user_id', profile.id);
      await supabase.from('wallet_transactions').insert({
        user_id: profile.id, type: 'credit', amount: credits,
        reason: `Cancelled ${menu?.meal_type}`, balance_after: nb,
      });
      setBookings(p => ({ ...p, [menuId]: { ...p[menuId], status: 'cancelled' } }));
      toast('success', `+${credits} credits earned!`);
    }
    setBookingLoading(null);
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  const mealOrder = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const sorted = [...menus].sort((a, b) => mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type));

  const mealColors: Record<string, string> = {
    breakfast: 'from-amber-500/20 to-orange-500/5 border-amber-500/30',
    lunch: 'from-emerald-500/20 to-green-500/5 border-emerald-500/30',
    snacks: 'from-blue-500/20 to-sky-500/5 border-blue-500/30',
    dinner: 'from-violet-500/20 to-purple-500/5 border-violet-500/30',
  };

  const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', snacks: '🫙', dinner: '🌙' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Meal Booking</h1>
          <p className="text-gray-400 text-sm mt-1">Confirm or cancel your meals</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white border border-gray-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-sm font-medium">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
          <button onClick={() => shiftDate(1)} className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white border border-gray-700 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {sorted.map(menu => {
            const booking = bookings[menu.id];
            const now = new Date();
            const cutoff = new Date(menu.cutoff_time);
            const isPast = now > cutoff;
            const isBooked = booking?.status === 'confirmed';
            const isCancelled = booking?.status === 'cancelled';
            const credits = CREDIT_VALUES[menu.meal_type];
            const minLeft = Math.max(0, Math.floor((cutoff.getTime() - now.getTime()) / 60000));

            return (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${mealColors[menu.meal_type]} border rounded-2xl overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{mealEmoji[menu.meal_type]}</span>
                      <div>
                        <h3 className="text-white font-bold text-lg capitalize">{menu.meal_type}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {menu.serving_time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {isBooked && (
                        <span className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium px-2.5 py-1 rounded-full">
                          <X className="w-3 h-3" /> Cancelled
                        </span>
                      )}
                      {!booking && !isPast && (
                        <span className="bg-gray-700 text-gray-400 text-xs px-2.5 py-1 rounded-full">Not booked</span>
                      )}
                    </div>
                  </div>

                  {!isPast && minLeft < 180 && (
                    <div className="mb-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-400 text-xs">
                      <Zap className="w-3 h-3" />
                      {minLeft === 0 ? 'Booking closed' : `Closes in ${Math.floor(minLeft / 60)}h ${minLeft % 60}m`}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {menu.meals.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between py-1.5 border-b border-gray-700/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${meal.is_veg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span className="text-gray-200 text-sm">{meal.name}</span>
                          {meal.is_spicy && <Flame className="w-3 h-3 text-orange-400" />}
                          {meal.allergens?.length > 0 && <AlertCircle className="w-3 h-3 text-amber-400" title={meal.allergens.join(', ')} />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{meal.calories} cal</span>
                          <span>{meal.protein}g protein</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-emerald-500" />
                      {menu.confirmed_count}/{menu.total_capacity} confirmed
                    </div>
                    {!isPast && <span className="text-emerald-400">Cancel = +{credits} credits</span>}
                  </div>

                  <div className="flex gap-2">
                    {!isPast && !isCancelled && (
                      isBooked ? (
                        <>
                          <button
                            onClick={() => setSelectedMeal(menu)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            <QrCode className="w-4 h-4" /> View QR
                          </button>
                          <button
                            onClick={() => booking && handleCancel(booking.id, menu.id)}
                            disabled={bookingLoading === menu.id}
                            className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            Cancel (+{credits} cr)
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleBook(menu.id)}
                          disabled={bookingLoading === menu.id}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          {bookingLoading === menu.id ? 'Booking...' : 'Confirm Meal'}
                        </button>
                      )
                    )}
                    {(isPast && !isBooked) && (
                      <div className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-500 text-sm text-center">
                        Booking Closed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedMeal && bookings[selectedMeal.id] && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full text-center"
          >
            <h3 className="text-white font-bold text-xl mb-2 capitalize">{selectedMeal.meal_type} QR Code</h3>
            <p className="text-gray-400 text-sm mb-6">{selectedMeal.serving_time}</p>
            <div className="w-48 h-48 mx-auto bg-white rounded-2xl flex items-center justify-center mb-6 p-4">
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-500 text-xs mb-2">QR Code ID</p>
            <p className="text-emerald-400 font-mono text-sm mb-6 break-all">{bookings[selectedMeal.id]?.qr_code}</p>
            <button onClick={() => setSelectedMeal(null)} className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white transition-colors">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
