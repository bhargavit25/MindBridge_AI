import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Smile, 
  Trash2, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Loader2, 
  TrendingUp,
  X
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const MOODS_CONFIG = [
  { label: 'Very Low', emoji: '🌧️', color: '#E4ECF2' },
  { label: 'Low', emoji: '⛅', color: '#E9E5F2' },
  { label: 'Okay', emoji: '🌱', color: '#E9EDE2' },
  { label: 'Good', emoji: '🌿', color: '#DCE5D5' },
  { label: 'Great', emoji: '☀️', color: '#F3D8C8' },
];

export const MoodPage = () => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('Okay');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editMood, setEditMood] = useState('');
  const [notification, setNotification] = useState('');

  const fetchMoods = async () => {
    try {
      setLoading(true);
      const data = await api.getMoodHistory();
      setMoods(data || []);
    } catch (err) {
      console.warn('Error loading moods:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const handleRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.recordMood(selectedMood, note);
      setNotification(`Recorded your feeling as "${selectedMood}".`);
      setNote('');
      setTimeout(() => setNotification(''), 4000);
      fetchMoods();
    } catch (err) {
      alert(err.message || 'Error recording mood');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mood entry?')) return;
    try {
      await api.deleteMood(id);
      setMoods((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err.message || 'Error deleting mood');
    }
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setEditMood(entry.mood);
    setEditNote(entry.note || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateMood(editingEntry.id, { mood: editMood, note: editNote });
      setMoods((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditingEntry(null);
      setNotification('Mood entry updated.');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert(err.message || 'Error updating mood');
    }
  };

  // Aggregate mood distribution for calm chart
  const moodCounts = {};
  moods.forEach((m) => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  const chartData = MOODS_CONFIG.map((cfg) => ({
    mood: cfg.label,
    count: moodCounts[cfg.label] || 0,
    color: cfg.color
  }));

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Mood Tracker
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D]">
          A peaceful, private space to acknowledge and honor your daily emotional states.
        </p>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Record Mood Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-5">
        <h2 className="text-sm font-semibold text-[#293B38]">
          How is your mind feeling right now?
        </h2>

        {/* Mood Selection Options */}
        <div className="flex flex-wrap gap-2.5">
          {MOODS_CONFIG.map((item) => {
            const isSelected = selectedMood === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelectedMood(item.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#DCE5D5] border-[#294A40] text-[#294A40] font-semibold shadow-sm'
                    : 'bg-[#FBFAF6] border-[#E5E8DF] text-[#293B38] hover:bg-[#E9EDE2] hover:border-[#DCE5D5]'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Note */}
        <form onSubmit={handleRecord} className="space-y-3">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an optional brief reflection (e.g. finished my assignment, went for a quiet walk)..."
            className="w-full px-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Recording...' : 'Record Mood'}
            </Button>
          </div>
        </form>
      </div>

      {/* Mood Distribution Simple Chart */}
      {moods.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#294A40]" />
              <h2 className="font-semibold text-sm text-[#293B38]">Mood Frequency Overview</h2>
            </div>
            <span className="text-xs text-[#78817D]">{moods.length} total check-ins</span>
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="mood" tick={{ fontSize: 11, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} check-ins`, 'Count']}
                  contentStyle={{ backgroundColor: '#FBFAF6', borderRadius: '16px', border: '1px solid #E5E8DF', fontSize: '11px', color: '#293B38' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#DCE5D5" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mood History Log */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#293B38]">
          Recent Reflections
        </h2>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
          </div>
        ) : moods.length > 0 ? (
          <div className="space-y-2.5">
            {moods.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center justify-between gap-3 hover:border-[#DCE5D5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {MOODS_CONFIG.find((c) => c.label === m.mood)?.emoji || '🌱'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#293B38]">{m.mood}</span>
                      <span className="text-[10px] text-[#969D97]">
                        {new Date(m.created_at).toLocaleDateString()} at {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {m.note && (
                      <p className="text-xs text-[#78817D] mt-0.5">{m.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(m)}
                    className="p-1.5 text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2] rounded-full transition-colors"
                    title="Edit note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-[#78817D] hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF]">
            No mood logs yet. Choose how you feel above to begin tracking.
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#294A40]/30 backdrop-blur-sm">
          <div className="bg-[#FBFAF6] border border-[#E5E8DF] rounded-3xl p-6 w-full max-w-md space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#293B38]">Update Mood Reflection</h3>
              <button onClick={() => setEditingEntry(null)} className="p-1 text-[#78817D] hover:text-[#293B38]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-xs text-[#78817D] mb-1">Feeling</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38]"
                >
                  {MOODS_CONFIG.map((c) => (
                    <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#78817D] mb-1">Reflection Note</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
