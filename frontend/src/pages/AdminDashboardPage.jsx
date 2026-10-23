import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  CalendarCheck, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

const SAGE_COLORS = ['#294A40', '#A9BDA5', '#DCE5D5', '#E9EDE2', '#F3D8C8', '#E4ECF2'];

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err.message || 'Failed to load administrative analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
        <p className="text-xs text-[#78817D] font-medium">Aggregating institutional wellness metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
        <div className="font-semibold mb-1">Access Notice</div>
        <p>{error}</p>
      </div>
    );
  }

  const phq9Data = Object.keys(analytics?.phq9_severity_distribution || {}).map((key) => ({
    severity: key,
    count: analytics.phq9_severity_distribution[key]
  }));

  const gad7Data = Object.keys(analytics?.gad7_severity_distribution || {}).map((key) => ({
    severity: key,
    count: analytics.gad7_severity_distribution[key]
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#294A40] font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#294A40]" />
          <span>Institutional Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Campus Wellness Analytics
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] max-w-2xl leading-relaxed">
          Aggregated, privacy-preserving psychological health metrics for campus leadership.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-3xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#293B38] text-xs flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#294A40] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#294A40]">Strict Student Privacy Protection</span>
          <p className="text-[#78817D] leading-relaxed">
            In compliance with psychological safety guidelines, all student mood entries, private journals, and chat dialogues remain strictly isolated and inaccessible to administrative accounts. Metrics shown are strictly anonymized campus-wide aggregates.
          </p>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-1">
          <div className="text-[11px] font-medium text-[#78817D]">Registered Students</div>
          <div className="text-2xl font-bold text-[#293B38]">
            {analytics?.total_students || 0}
          </div>
          <div className="text-[10px] text-[#294A40]">Active student accounts</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-1">
          <div className="text-[11px] font-medium text-[#78817D]">Campus Counsellors</div>
          <div className="text-2xl font-bold text-[#293B38]">
            {analytics?.total_counsellors || 0}
          </div>
          <div className="text-[10px] text-[#294A40]">Licensed practitioners</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-1">
          <div className="text-[11px] font-medium text-[#78817D]">Completed Screenings</div>
          <div className="text-2xl font-bold text-[#293B38]">
            {analytics?.total_assessments || 0}
          </div>
          <div className="text-[10px] text-[#294A40]">PHQ-9 & GAD-7 submissions</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-1">
          <div className="text-[11px] font-medium text-[#78817D]">Consultation Sessions</div>
          <div className="text-2xl font-bold text-[#293B38]">
            {analytics?.total_appointments || 0}
          </div>
          <div className="text-[10px] text-[#294A40]">1-on-1 bookings</div>
        </div>
      </div>

      {/* Aggregate Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* PHQ-9 Aggregate Severity */}
        <div className="p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#293B38]">PHQ-9 Depression Severity Distribution</h3>
            <span className="text-[10px] text-[#78817D]">Aggregate</span>
          </div>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phq9Data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="severity" tick={{ fontSize: 10, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FBFAF6', borderRadius: '16px', border: '1px solid #E5E8DF', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {phq9Data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={SAGE_COLORS[i % SAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GAD-7 Aggregate Severity */}
        <div className="p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[#293B38]">GAD-7 Anxiety Severity Distribution</h3>
            <span className="text-[10px] text-[#78817D]">Aggregate</span>
          </div>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gad7Data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="severity" tick={{ fontSize: 10, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FBFAF6', borderRadius: '16px', border: '1px solid #E5E8DF', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {gad7Data.map((_, i) => (
                    <Cell key={`cell-gad-${i}`} fill={SAGE_COLORS[(i + 2) % SAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
