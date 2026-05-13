import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Home, Hash, Save, Shield, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    hostel_name: profile?.hostel_name || '',
    room_number: profile?.room_number || '',
    diet_preference: profile?.diet_preference || 'veg',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    toast('success', 'Profile updated successfully');
    setSaving(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information</p>
      </div>

      {/* Avatar card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-5"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black">
          {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">{profile?.full_name}</h2>
          <p className="text-emerald-400 text-sm capitalize">{profile?.role?.replace('_', ' ')}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{profile?.student_id || 'No ID'}</span>
            <span className="flex items-center gap-1"><Home className="w-3 h-3" />{profile?.hostel_name || 'No hostel'}</span>
            <span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" />{profile?.mess_id}</span>
          </div>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
      >
        <h3 className="text-white font-bold mb-5">Personal Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={profile?.email || ''} disabled
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hostel Name</label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={form.hostel_name} onChange={e => set('hostel_name', e.target.value)}
                  placeholder="Kaveri Hostel"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Number</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={form.room_number} onChange={e => set('room_number', e.target.value)}
                  placeholder="A-204"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Diet Preference</label>
            <div className="grid grid-cols-3 gap-3">
              {(['veg', 'non_veg', 'both'] as const).map(d => (
                <button key={d} type="button" onClick={() => set('diet_preference', d)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.diet_preference === d ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  {d === 'non_veg' ? 'Non-Veg' : d === 'both' ? 'Both' : 'Vegetarian'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
