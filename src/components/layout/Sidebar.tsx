import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, UtensilsCrossed, Wallet, Bell, AlertTriangle,
  ShoppingBag, User, Settings, LogOut, ChevronLeft, ChevronRight,
  BarChart3, Users, ClipboardList, Moon, BookOpen, Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/meals', icon: UtensilsCrossed, label: 'Meal Booking' },
  { to: '/wallet', icon: Wallet, label: 'Credits & Wallet' },
  { to: '/canteen', icon: ShoppingBag, label: 'Canteen' },
  { to: '/night-canteen', icon: Moon, label: 'Night Canteen' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/complaints', icon: AlertTriangle, label: 'Complaints' },
  { to: '/history', icon: BookOpen, label: 'History' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/menus', icon: UtensilsCrossed, label: 'Menu Management' },
  { to: '/admin/bookings', icon: ClipboardList, label: 'Bookings' },
  { to: '/admin/complaints', icon: AlertTriangle, label: 'Complaints' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/waste', icon: Leaf, label: 'Waste Reports' },
  { to: '/admin/canteen', icon: ShoppingBag, label: 'Canteen' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const isAdmin = profile?.role === 'mess_admin' || profile?.role === 'super_admin';
  const links = isAdmin ? adminLinks : studentLinks;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 z-40 flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 overflow-hidden"
            >
              <span className="font-bold text-white text-lg leading-none">MessMind</span>
              <span className="block text-emerald-400 text-xs font-medium">AI Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            onMouseEnter={() => setHovered(to)}
            onMouseLeave={() => setHovered(null)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium relative z-10 whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && hovered === to && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 border border-gray-700">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile + Logout */}
      <div className="border-t border-gray-800 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-white text-sm font-medium truncate max-w-[140px]">{profile?.full_name || 'User'}</p>
                <p className="text-gray-400 text-xs capitalize">{profile?.role?.replace('_', ' ')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
