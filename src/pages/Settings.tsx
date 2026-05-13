import { motion } from 'framer-motion';
import { Bell, Shield, Moon, Smartphone, Globe, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Toggle { label: string; desc: string; enabled: boolean }

export default function Settings() {
  const [notifications, setNotifications] = useState<Toggle[]>([
    { label: 'Meal Reminders', desc: 'Get reminded before meal booking closes', enabled: true },
    { label: 'Favourite Meal Alerts', desc: 'Notify when your favourite food is available', enabled: true },
    { label: 'Credit Earned', desc: 'Notify when you earn meal credits', enabled: true },
    { label: 'Special Menu', desc: 'Alert for festival or special menus', enabled: false },
    { label: 'Canteen Offers', desc: 'Deals and discounts at the canteen', enabled: false },
  ]);

  const [privacy, setPrivacy] = useState<Toggle[]>([
    { label: 'Anonymous Complaints', desc: 'Submit complaints without revealing identity', enabled: true },
    { label: 'Analytics Sharing', desc: 'Help improve predictions by sharing anonymized data', enabled: true },
  ]);

  function toggle(arr: Toggle[], setArr: React.Dispatch<React.SetStateAction<Toggle[]>>, i: number) {
    setArr(prev => prev.map((t, idx) => idx === i ? { ...t, enabled: !t.enabled } : t));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Customize your MessMind experience</p>
      </div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-800">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-bold">Notifications</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {notifications.map((n, i) => (
            <div key={n.label} className="flex items-center justify-between p-4">
              <div>
                <p className="text-white text-sm font-medium">{n.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => toggle(notifications, setNotifications, i)}
                className={`relative w-11 h-6 rounded-full transition-colors ${n.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${n.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-800">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-bold">Privacy</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {privacy.map((n, i) => (
            <div key={n.label} className="flex items-center justify-between p-4">
              <div>
                <p className="text-white text-sm font-medium">{n.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => toggle(privacy, setPrivacy, i)}
                className={`relative w-11 h-6 rounded-full transition-colors ${n.enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${n.enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* App info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-800">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-bold">About</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Platform', value: 'MessMind AI' },
            { label: 'Support', value: 'support@messmind.ai' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-4">
              <p className="text-gray-400 text-sm">{label}</p>
              <p className="text-white text-sm">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
