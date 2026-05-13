import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Mail, Lock, User, Hash, Home, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function Signup() {
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    student_id: '', hostel_name: '', room_number: '', phone: '',
    role: 'student' as 'student' | 'mess_admin',
    diet_preference: 'veg' as 'veg' | 'non_veg' | 'both',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm_password) return toast('error', 'Passwords do not match');
    if (form.password.length < 6) return toast('error', 'Password must be at least 6 characters');
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form);
    setLoading(false);
    if (error) {
      toast('error', 'Signup failed', error.message);
    } else {
      toast('success', 'Account created!', 'Welcome to MessMind AI');
      navigate(form.role === 'mess_admin' ? '/admin' : '/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">MessMind AI</span>
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-emerald-500' : 'bg-gray-800'}`} />
            ))}
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{step === 1 ? 'Create account' : 'Complete profile'}</h2>
          <p className="text-gray-400 text-sm mb-6">{step === 1 ? 'Join MessMind AI today' : 'Tell us more about you'}</p>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['student', 'mess_admin'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => set('role', r)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.role === r ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
                      >
                        {r === 'student' ? 'Student' : 'Mess Admin'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)}
                      placeholder="Arjun Sharma" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="arjun@iitd.ac.in" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min. 6 characters" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)}
                      placeholder="••••••••" required
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Student ID</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={form.student_id} onChange={e => set('student_id', e.target.value)}
                        placeholder="2021CS123"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
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
                    <input type="text" value={form.room_number} onChange={e => set('room_number', e.target.value)}
                      placeholder="A-204"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Diet Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['veg', 'non_veg', 'both'] as const).map(d => (
                      <button key={d} type="button" onClick={() => set('diet_preference', d)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.diet_preference === d ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
                      >
                        {d === 'non_veg' ? 'Non-Veg' : d === 'both' ? 'Both' : 'Vegetarian'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors">
                    {loading ? 'Creating...' : <><ArrowRight className="w-4 h-4" /> Create Account</>}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
