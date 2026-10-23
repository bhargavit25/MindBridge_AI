import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Clock, 
  X, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  'All',
  'Mindfulness & Breathing',
  'Anxiety Coping',
  'Sleep Hygiene',
  'Academic Burnout',
  'Stress Management',
  'Healthy Study Habits',
  'Social Connection',
  'Seeking Professional Help'
];

export const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getResources(activeCategory, searchTerm);
      setResources(data || []);
    } catch (err) {
      console.warn('Error fetching resources:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleOpenDetail = async (res) => {
    try {
      const full = await api.getResource(res.id);
      setSelectedResource(full);
    } catch (err) {
      setSelectedResource(res);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans text-[#293B38]">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#294A40] bg-[#E9EDE2] px-3 py-1 rounded-full border border-[#DCE5D5]">
          Curated Psychoeducation
        </span>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#293B38] tracking-tight">
          Self-Help & Wellness Library
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          Evidence-based psychological resources, sleep habits, and practical stress reduction tools crafted for students.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#969D97] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics (e.g. panic, breathing, burnout)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-full border border-[#E5E8DF] bg-[#FBFAF6] text-xs sm:text-sm text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#294A40] hover:bg-[#1F3831] text-[#FBFAF6] font-medium text-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isActive
                  ? 'bg-[#294A40] text-[#FBFAF6] font-semibold shadow-sm'
                  : 'bg-[#FBFAF6] border border-[#E5E8DF] text-[#78817D] hover:bg-[#E9EDE2] hover:text-[#293B38]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div
              key={res.id}
              onClick={() => handleOpenDetail(res)}
              className="p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-3 flex flex-col justify-between hover:border-[#DCE5D5] hover:-translate-y-0.5 transition-all cursor-pointer group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-[#969D97] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#969D97]" />
                    {res.read_time_minutes || 4} min read
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-[#293B38] group-hover:text-[#294A40] transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-[#78817D] leading-relaxed line-clamp-3">
                  {res.summary}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs font-medium text-[#294A40]">
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF]">
          No resources found matching this criteria. Try selecting "All" or a different search term.
        </div>
      )}

      {/* Detail Reading Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#294A40]/30 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FBFAF6] border border-[#E5E8DF] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-xl animate-fade-in my-8">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E5E8DF]">
              <div className="space-y-1">
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]">
                  {selectedResource.category}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#293B38] tracking-tight">
                  {selectedResource.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1.5 text-[#78817D] hover:text-[#293B38] rounded-full hover:bg-[#E9EDE2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-[#78817D] leading-relaxed whitespace-pre-wrap space-y-4 font-sans">
              {selectedResource.content || selectedResource.summary}
            </div>

            <div className="pt-4 border-t border-[#E5E8DF] flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedResource(null)}
              >
                Close Article
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
