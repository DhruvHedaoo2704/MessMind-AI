import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Zap, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, WalletTransaction, CREDIT_VALUES } from '../../lib/supabase';

export default function Wallet() {
  const { profile } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, emergency_credits: 3, total_earned: 0, total_spent: 0, streak_days: 0 });
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadData();
  }, [profile]);

  async function loadData() {
    setLoading(true);
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', profile!.id).maybeSingle(),
      supabase.from('wallet_transactions').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(30),
    ]);
    if (w) setWallet(w);
    setTxns(t || []);
    setLoading(false);
  }

  const creditTxns = txns.filter(t => t.type === 'credit');
  const debitTxns = txns.filter(t => t.type === 'debit');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Credits & Wallet</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your meal credits and transactions</p>
      </div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/30 rounded-3xl p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-white font-black text-4xl">{wallet.balance} <span className="text-emerald-400 text-xl">credits</span></p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-900/40 rounded-2xl p-4 text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold text-xl">{wallet.emergency_credits}</p>
              <p className="text-gray-500 text-xs">Emergency Credits</p>
            </div>
            <div className="bg-gray-900/40 rounded-2xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-bold text-xl">{wallet.total_earned}</p>
              <p className="text-gray-500 text-xs">Total Earned</p>
            </div>
            <div className="bg-gray-900/40 rounded-2xl p-4 text-center">
              <Award className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-bold text-xl">{wallet.streak_days}</p>
              <p className="text-gray-500 text-xs">Day Streak</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credit Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { meal: 'Breakfast', credits: CREDIT_VALUES.breakfast, emoji: '🌅' },
          { meal: 'Lunch', credits: CREDIT_VALUES.lunch, emoji: '☀️' },
          { meal: 'Snacks', credits: CREDIT_VALUES.snacks, emoji: '🫙' },
          { meal: 'Dinner', credits: CREDIT_VALUES.dinner, emoji: '🌙' },
        ].map(({ meal, credits, emoji }) => (
          <motion.div
            key={meal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center"
          >
            <span className="text-3xl mb-2 block">{emoji}</span>
            <p className="text-gray-400 text-sm">{meal}</p>
            <p className="text-emerald-400 font-bold text-xl">+{credits}</p>
            <p className="text-gray-600 text-xs">on cancel</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold">Transaction History</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-emerald-400"><ArrowUpRight className="w-3 h-3" />{creditTxns.length} credits</span>
            <span className="flex items-center gap-1 text-red-400"><ArrowDownRight className="w-3 h-3" />{debitTxns.length} debits</span>
          </div>
        </div>
        <div className="divide-y divide-gray-800">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-48" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-24" />
                </div>
              </div>
            ))
          ) : txns.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <WalletIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No transactions yet</p>
            </div>
          ) : (
            txns.map(txn => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {txn.type === 'credit'
                    ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                    : <TrendingDown className="w-5 h-5 text-red-400" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{txn.reason}</p>
                  <p className="text-gray-500 text-xs">{new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                  </p>
                  <p className="text-gray-600 text-xs">{txn.balance_after} bal</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
