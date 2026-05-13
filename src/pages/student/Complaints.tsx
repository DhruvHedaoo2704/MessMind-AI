import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, X, Send, Clock, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, Complaint } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';

const categories = ['food_quality', 'hygiene', 'service', 'quantity', 'other'];
const priorities = ['low', 'medium', 'high', 'critical'];

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_review: { label: 'In Review', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  dismissed: { label: 'Dismissed', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

const priorityColor = {
  low: 'text-gray-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export default function Complaints() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'food_quality', priority: 'medium', meal_type: '', is_anonymous: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) loadComplaints();
  }, [profile]);

  async function loadComplaints() {
    setLoading(true);
    const { data } = await supabase.from('complaints').select('*')
      .eq('user_id', profile!.id).order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  }

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) return toast('error', 'Fill all required fields');
    setSubmitting(true);
    const { error } = await supabase.from('complaints').insert({
      ...form,
      user_id: profile!.id,
      date: new Date().toISOString().split('T')[0],
    });
    if (error) toast('error', 'Failed to submit complaint');
    else {
      toast('success', 'Complaint submitted', 'We\'ll review it soon.');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'food_quality', priority: 'medium', meal_type: '', is_anonymous: true });
      loadComplaints();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Complaints</h1>
          <p className="text-gray-400 text-sm mt-1">Report food quality, hygiene, or service issues</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className={`p-4 rounded-2xl border ${cfg.color} text-center`}>
            <p className="text-2xl font-black">{complaints.filter(c => c.status === key).length}</p>
            <p className="text-sm">{cfg.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-gray-800/50 rounded-2xl animate-pulse" />)}</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No complaints filed yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c, i) => {
            const sc = statusConfig[c.status];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-white font-semibold">{c.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-xs capitalize">{c.category.replace('_', ' ')}</span>
                      <span className="text-gray-700">·</span>
                      <span className={`text-xs capitalize font-medium ${priorityColor[c.priority as keyof typeof priorityColor]}`}>{c.priority} priority</span>
                      {c.is_anonymous && <span className="text-xs text-gray-500">Anonymous</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${sc.color}`}>{sc.label}</span>
                </div>
                <p className="text-gray-400 text-sm">{c.description}</p>
                {c.admin_response && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-400 text-xs font-medium mb-1">Admin Response</p>
                    <p className="text-gray-300 text-sm">{c.admin_response}</p>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-3 text-gray-600 text-xs">
                  <Clock className="w-3 h-3" />
                  {new Date(c.created_at).toLocaleDateString('en-IN')}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-xl">File a Complaint</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitComplaint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  placeholder="Brief description of the issue"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors">
                    {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors">
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4}
                  placeholder="Describe the issue in detail..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-500" />
                <span className="text-gray-300 text-sm">Submit anonymously</span>
              </label>
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors">
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
