import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Search, Leaf, Star, X, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, CanteenItem } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';

interface CartItem extends CanteenItem { qty: number }

interface CanteenProps { nightMode?: boolean }

const FOOD_IMAGES: Record<string, string> = {
  'Maggi Noodles': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Egg Maggi': 'https://images.pexels.com/photos/4518624/pexels-photo-4518624.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Bread Omelette': 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Veg Sandwich': 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Cold Coffee': 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Masala Chai': 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
  'French Fries': 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Chocolate Donuts': 'https://images.pexels.com/photos/3776938/pexels-photo-3776938.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Paneer Roll': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Chicken Roll': 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Aloo Paratha': 'https://images.pexels.com/photos/9609843/pexels-photo-9609843.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Dal Makhani': 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=400',
};

const DEFAULT_IMG = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400';

export default function Canteen({ nightMode = false }: CanteenProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [payMethod, setPayMethod] = useState<'credits' | 'cash'>('credits');

  useEffect(() => {
    loadItems();
  }, [nightMode]);

  async function loadItems() {
    setLoading(true);
    let q = supabase.from('canteen_items').select('*').eq('is_available', true);
    if (nightMode) q = q.eq('is_night_canteen', true);
    const { data } = await q;
    setItems(data || []);
    setLoading(false);
  }

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = items.filter(i =>
    (activeCategory === 'All' || i.category === activeCategory) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(item: CanteenItem) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));
  }

  const totalCredits = cart.reduce((s, c) => s + c.credit_price * c.qty, 0);
  const totalCash = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  async function placeOrder() {
    if (!profile || cart.length === 0) return;
    setOrdering(true);
    const items_json = cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: payMethod === 'credits' ? c.credit_price : c.price }));

    if (payMethod === 'credits') {
      const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', profile.id).maybeSingle();
      if (!w || w.balance < totalCredits) {
        toast('error', 'Insufficient credits', `You need ${totalCredits} credits but have ${w?.balance || 0}.`);
        setOrdering(false);
        return;
      }
      const nb = w.balance - totalCredits;
      await supabase.from('wallets').update({ balance: nb }).eq('user_id', profile.id);
      await supabase.from('wallet_transactions').insert({
        user_id: profile.id, type: 'debit', amount: totalCredits,
        reason: `Canteen order (${cart.map(c => c.name).join(', ')})`, balance_after: nb,
      });
    }

    await supabase.from('canteen_orders').insert({
      user_id: profile.id, items: items_json,
      total_amount: payMethod === 'credits' ? totalCredits : totalCash,
      payment_method: payMethod, is_night_canteen: nightMode, estimated_time: 15,
    });

    toast('success', 'Order placed!', 'Ready in ~15 minutes.');
    setCart([]);
    setShowCart(false);
    setOrdering(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{nightMode ? '🌙 Night Canteen' : '🍽️ Canteen'}</h1>
          <p className="text-gray-400 text-sm mt-1">{nightMode ? 'Available 10 PM – 2 AM' : 'Order fresh food anytime'}</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search food..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden transition-colors"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={FOOD_IMAGES[item.name] || DEFAULT_IMG}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`w-5 h-5 rounded-sm border-2 ${item.is_veg ? 'border-emerald-500 bg-emerald-500/20' : 'border-red-500 bg-red-500/20'} flex items-center justify-center`}>
                      <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </span>
                  </div>
                  {inCart && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {inCart.qty}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white font-semibold text-sm mb-0.5">{item.name}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-gray-400 text-xs">{item.rating}</span>
                    <span className="text-gray-600 text-xs">· {item.calories} cal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold text-sm">{item.credit_price} cr</span>
                      <span className="text-gray-600 text-xs ml-1">/ ₹{item.price}</span>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-lg bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm font-bold w-5 text-center">{inCart.qty}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowCart(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-gray-900 border-l border-gray-700 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-700">
                <h2 className="text-white font-bold text-lg">Your Cart ({cartCount})</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                      <img src={FOOD_IMAGES[item.name] || DEFAULT_IMG} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-emerald-400 text-xs">{item.credit_price * item.qty} cr</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded-lg bg-gray-700 text-gray-300 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-700 space-y-3">
                  <div className="flex gap-2">
                    {(['credits', 'cash'] as const).map(m => (
                      <button key={m} onClick={() => setPayMethod(m)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-colors ${payMethod === m ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400'}`}>
                        {m === 'credits' ? <Leaf className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                        {m === 'credits' ? 'Credits' : 'Cash / UPI'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-white font-bold">
                      {payMethod === 'credits' ? `${totalCredits} credits` : `₹${totalCash}`}
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={ordering}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {ordering ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
