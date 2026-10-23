import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ClipboardCheck, 
  ArrowRight, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const AssessmentsHubPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getAssessmentHistory();
        setHistory(data || []);
      } catch (err) {
        console.warn('Error loading history:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const chartData = history.slice().reverse().map((h) => ({
    date: new Date(h.completed_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
    score: h.total_score,
    type: h.assessment_type,
    severity: h.severity
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Mental Health Self-Screening
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] max-w-2xl leading-relaxed">
          Standardized clinical screening tools help evaluate symptoms of depression (PHQ-9) and generalized anxiety (GAD-7) over the past two weeks.
        </p>
      </div>

      {/* Non-Diagnostic Clinical Clarification Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#293B38] text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#294A40] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-[#294A40]">Understanding Screening Tools</div>
          <p className="text-[#78817D] leading-relaxed">
            These questionnaires are self-administered check-in instruments used globally. They offer helpful insights into recent emotional distress, but <strong>do not constitute a medical diagnosis</strong>. Licensed campus counsellors are available if you would like professional guidance.
          </p>
        </div>
      </div>

      {/* Two Assessment Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        {/* PHQ-9 Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4 flex flex-col justify-between hover:border-[#DCE5D5] transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#294A40] bg-[#E9EDE2] px-2.5 py-0.5 rounded-full border border-[#DCE5D5]">
                Depression Screener
              </span>
              <span className="text-xs text-[#78817D]">9 Questions • ~3 mins</span>
            </div>
            <h3 className="text-lg font-semibold text-[#293B38]">PHQ-9 Assessment</h3>
            <p className="text-xs text-[#78817D] leading-relaxed">
              Reflects on mood, energy levels, sleep patterns, interest in activities, and feelings of overwhelm over the prior two weeks.
            </p>
            <div className="pt-1 text-[11px] text-[#78817D] space-y-0.5">
              <div>• <strong>Score Range:</strong> 0 to 27</div>
              <div>• <strong>Classification:</strong> Minimal, Mild, Moderate, Moderately Severe, Severe</div>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/assessments/phq9" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                <span>Start PHQ-9 Screening</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* GAD-7 Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4 flex flex-col justify-between hover:border-[#DCE5D5] transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#294A40] bg-[#E9EDE2] px-2.5 py-0.5 rounded-full border border-[#DCE5D5]">
                Anxiety Screener
              </span>
              <span className="text-xs text-[#78817D]">7 Questions • ~2 mins</span>
            </div>
            <h3 className="text-lg font-semibold text-[#293B38]">GAD-7 Assessment</h3>
            <p className="text-xs text-[#78817D] leading-relaxed">
              Assesses generalized anxiety, worry, difficulty relaxing, restlessness, and feelings of nervousness over the prior two weeks.
            </p>
            <div className="pt-1 text-[11px] text-[#78817D] space-y-0.5">
              <div>• <strong>Score Range:</strong> 0 to 21</div>
              <div>• <strong>Classification:</strong> Minimal, Mild, Moderate, Severe</div>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/assessments/gad7" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                <span>Start GAD-7 Screening</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* Historical Progression Graph (Calm Muted Sage) */}
      {chartData.length > 1 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#294A40]" />
              <h2 className="font-semibold text-sm text-[#293B38]">Screening Score Progression</h2>
            </div>
            <span className="text-[11px] text-[#78817D]">Total Scores Over Time</span>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8DF" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 27]} tick={{ fontSize: 11, fill: '#78817D' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val, name, props) => [`Score: ${val} (${props.payload.severity})`, props.payload.type]}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                  contentStyle={{ backgroundColor: '#FBFAF6', borderRadius: '16px', border: '1px solid #E5E8DF', fontSize: '11px', color: '#293B38' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#294A40" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#294A40' }}
                  activeDot={{ r: 6, fill: '#A9BDA5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Screening History Table */}
      <div className="rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] overflow-hidden space-y-4 p-6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#294A40]" />
          <h2 className="font-semibold text-sm text-[#293B38]">Past Screening Submissions</h2>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E9EDE2]/60 text-[#78817D] font-medium uppercase tracking-wider border-b border-[#E5E8DF]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Screening</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Next Steps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8DF] text-[#293B38]">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-[#E9EDE2]/30 transition-colors">
                    <td className="py-2.5 px-3 text-[#78817D] whitespace-nowrap">
                      {new Date(h.completed_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#293B38]">{h.assessment_type}</td>
                    <td className="py-2.5 px-3 font-bold text-[#294A40]">{h.total_score}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40] font-medium text-[11px]">
                        {h.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {h.flagged_safety ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#FBF4EE] text-rose-800 font-medium text-[10px] flex items-center gap-1 w-fit border border-[#F3D8C8]">
                          <ShieldAlert className="w-3 h-3 text-rose-700" /> Support Indicated
                        </span>
                      ) : (
                        <span className="text-[#294A40] font-medium text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#294A40]" /> Clear
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#78817D] max-w-xs truncate text-[11px]">
                      {h.recommendation || 'Standard self-care reflection'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#78817D]">
            No previous screenings on record. Take an assessment above to establish your baseline.
          </div>
        )}
      </div>

    </div>
  );
};
