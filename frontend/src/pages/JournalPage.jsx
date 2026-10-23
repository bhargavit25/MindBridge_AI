import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookHeart, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  X,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const JournalPage = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('Okay');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const moodTags = ['Great', 'Good', 'Okay', 'Low', 'Very Low'];

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const data = await api.getJournals();
      setJournals(data || []);
    } catch (err) {
      console.warn('Error fetching journals:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await api.updateJournal(editingId, {
          title: title.trim(),
          content: content.trim(),
          mood_tag: moodTag
        });
        setJournals((prev) => prev.map((j) => (j.id === editingId ? updated : j)));
        setNotice('Journal reflection updated.');
      } else {
        const created = await api.createJournal({
          title: title.trim(),
          content: content.trim(),
          mood_tag: moodTag
        });
        setJournals((prev) => [created, ...prev]);
        setNotice('New private reflection saved.');
      }

      // Reset
      setIsCreating(false);
      setEditingId(null);
      setTitle('');
      setContent('');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Error saving journal reflection.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (j) => {
    setEditingId(j.id);
    setTitle(j.title);
    setContent(j.content);
    setMoodTag(j.mood_tag || 'Okay');
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal reflection? This cannot be undone.')) return;
    try {
      await api.deleteJournal(id);
      setJournals((prev) => prev.filter((j) => j.id !== id));
      setNotice('Journal reflection removed.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.message || 'Error deleting journal.');
    }
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
              Confidential Journal
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#294A40] bg-[#E9EDE2] px-2 py-0.5 rounded-full border border-[#DCE5D5]">
              <Lock className="w-3 h-3 text-[#294A40]" /> Private
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#78817D]">
            A quiet, paper-like space to write freely. Your words are visible only to you.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
            setMoodTag('Okay');
            setIsCreating(true);
          }}
        >
          New Reflection
        </Button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Input */}
      {journals.length > 0 && !isCreating && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#78817D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past thoughts and entries..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
          />
        </div>
      )}

      {/* Distraction-Free Writing Area (Warm paper-like background) */}
      {isCreating && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_12px_rgba(41,59,56,0.03)] space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E8DF]">
            <span className="text-xs font-semibold text-[#294A40]">
              {editingId ? 'Edit Private Reflection' : 'New Journal Reflection'}
            </span>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 text-[#78817D] hover:text-[#293B38] rounded-full hover:bg-[#E9EDE2]"
              aria-label="Close reflection form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this moment a title..."
                required
                className="w-full px-4 py-2.5 text-sm rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Mood Association
              </label>
              <div className="flex flex-wrap gap-2">
                {moodTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMoodTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      moodTag === tag
                        ? 'bg-[#DCE5D5] text-[#294A40] border border-[#294A40] font-semibold'
                        : 'bg-[#FBFAF6] border border-[#E5E8DF] text-[#78817D] hover:bg-[#E9EDE2]'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Your Thoughts
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely without judgment. How are you feeling? What was challenging or peaceful today?..."
                rows={8}
                required
                className="w-full p-4 text-xs sm:text-sm rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40] leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#969D97] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#294A40]" /> Encrypted & Private to you
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Reflection' : 'Save Reflection'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
          </div>
        ) : filteredJournals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredJournals.map((j) => (
              <div
                key={j.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-3 hover:border-[#DCE5D5] transition-all shadow-[0_2px_8px_rgba(41,59,56,0.02)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#293B38]">
                        {j.title}
                      </span>
                      {j.mood_tag && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]">
                          {j.mood_tag}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#78817D] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#969D97]" />
                      <span>{new Date(j.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(j)}
                      className="p-1.5 text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2] rounded-full transition-colors"
                      title="Edit reflection"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="p-1.5 text-[#78817D] hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                      title="Delete reflection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed whitespace-pre-wrap font-sans">
                  {j.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-2">
            <p>Your journal is quiet right now.</p>
            <p className="text-[11px] text-[#969D97]">Click "New Reflection" to write your first entry.</p>
          </div>
        )}
      </div>

    </div>
  );
};
