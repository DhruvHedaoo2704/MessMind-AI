import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, Notification } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  success: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  error: { icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  reminder: { icon: Bookmark, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
};

export default function Notifications() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) loadNotifications();
  }, [profile]);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile!.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast('success', 'All notifications marked as read');
  }

  async function seedDemoNotifications() {
    if (!profile) return;
    const demos = [
      { user_id: profile.id, title: 'Favourite meal available!', message: 'Paneer Butter Masala is on today\'s lunch menu.', type: 'success' as const },
      { user_id: profile.id, title: 'Meal booking closing soon', message: 'Dinner booking closes in 30 minutes. Book now!', type: 'reminder' as const },
      { user_id: profile.id, title: 'Credits earned', message: 'You earned 25 credits for cancelling lunch.', type: 'info' as const },
      { user_id: profile.id, title: 'Special menu today!', message: 'Festival special menu for dinner. Don\'t miss out!', type: 'info' as const },
      { user_id: profile.id, title: 'No-show warning', message: 'You missed 3 booked meals this month. 2 more may result in penalty.', type: 'warning' as const },
    ];
    await supabase.from('notifications').insert(demos);
    await loadNotifications();
    toast('success', 'Demo notifications loaded');
  }

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            Notifications
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{notifications.length} total, {unread} unread</p>
        </div>
        <div className="flex gap-2">
          {notifications.length === 0 && (
            <button onClick={seedDemoNotifications} className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-xl transition-colors">
              Load Demo
            </button>
          )}
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-3 py-2 rounded-xl transition-colors">
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:border-gray-700 ${n.is_read ? 'bg-gray-900/50 border-gray-800/50 opacity-70' : 'bg-gray-900 border-gray-800'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${n.is_read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.is_read && (
                  <button onClick={e => { e.stopPropagation(); markRead(n.id); }} className="text-gray-600 hover:text-emerald-400 transition-colors flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
