import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageSquare, CheckCircle, Clock, X, Send } from 'lucide-react';
import { supabase, Complaint } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  in_review: { label: 'In Review', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  dismissed: { label: 'Dismissed', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
};

const priorityColor = { low: 'text-gray-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' };

export default function AdminComplaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => { loadComplaints(); }, []);

  async function loadComplaints() {
    setLoading(true);
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('complaints').update({ status }).eq('id', id);
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: status as Complaint['status'] } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Complaint['status'] } : null);
    toast('success', 'Status updated');
  }

  async function submitResponse() {
    if (!selected || !response.trim()) return;
    setResponding(true);
    await supabase.from('complaints').update({ admin_response: response, status: 'resolved' }).eq('id', selected.id);
    setComplaints(prev => prev.map(c => c.id === selected.id ? { ...c, admin_response: response, status: 'resolved' } : c));
    toast('success', 'Response sent');
    setSelected(null);
    setResponse('');
    setResponding(false);
  }

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Complaint Management</h1>
        <p className="text-gray-400 text-sm mt-1">Review and respond to student complaints</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`p-4 rounded-2xl border text-center transition-all ${filter === key ? 'ring-2 ring-emerald-500' : ''} ${cfg.color}`}>
            <p className="text-2xl font-black">{complaints.filter(c => c.status === key).length}</p>
            <p className="text-sm">{cfg.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}>
          All
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-800/50 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const sc = statusConfig[c.status];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 cursor-pointer transition-colors"
                onClick={() => setSelected(c)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium capitalize ${priorityColor[c.priority as keyof typeof priorityColor]}`}>{c.priority}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-gray-500 text-xs capitalize">{c.category.replace('_', ' ')}</span>
                      {c.is_anonymous && <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">Anonymous</span>}
                    </div>
                    <h3 className="text-white font-semibold">{c.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{c.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${sc.color}`}>{sc.label}</span>
                    <span className="text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                {c.admin_response && (
                  <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-emerald-400 text-xs">Responded</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded-full border font-medium text-xs ${statusConfig[selected.status].color}`}>{statusConfig[selected.status].label}</span>
                <span className={`text-xs font-medium capitalize ${priorityColor[selected.priority as keyof typeof priorityColor]}`}>{selected.priority} priority</span>
                <span className="text-gray-500 capitalize text-xs">{selected.category.replace('_', ' ')}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{selected.description}</p>
              {selected.admin_response && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-400 text-xs font-medium mb-1">Previous Response</p>
                  <p className="text-gray-300 text-sm">{selected.admin_response}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {(['pending', 'in_review', 'resolved', 'dismissed'] as const).map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border capitalize ${selected.status === s ? statusConfig[s].color + ' ring-1 ring-current' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                placeholder="Write your response to the student..."
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none text-sm"
              />
              <button onClick={submitResponse} disabled={responding || !response.trim()}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Send className="w-4 h-4" />
                {responding ? 'Sending...' : 'Send Response & Resolve'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
