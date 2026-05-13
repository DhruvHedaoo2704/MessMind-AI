import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [unread, setUnread] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_read', false)
      .then(({ count }) => setUnread(count || 0));
  }, [profile]);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const leftOffset = sidebarCollapsed ? 72 : 260;

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-gray-900/95 backdrop-blur border-b border-gray-800 z-30 flex items-center px-6 gap-4 transition-all duration-300"
      style={{ left: leftOffset }}
    >
      <div className="flex-1">
        <p className="text-white text-sm font-medium">
          {greeting()}, <span className="text-emerald-400">{profile?.full_name?.split(' ')[0] || 'there'}</span>
        </p>
        <p className="text-gray-500 text-xs">
          {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="relative hidden md:flex items-center">
        <Search className="w-4 h-4 text-gray-500 absolute left-3" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-52"
        />
      </div>

      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <button
        onClick={() => navigate('/notifications')}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <button onClick={() => navigate('/profile')} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </button>
    </header>
  );
}
