import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  ClipboardCheck, 
  CalendarCheck, 
  Library, 
  Sparkles, 
  ArrowRight, 
  Wind, 
  CheckCircle2, 
  Clock, 
  Heart,
  Loader2,
  Calendar,
  Smile
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MoodSelector } from '../components/ui/MoodSelector';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick mood recording state
  const [submittingMood, setSubmittingMood] = useState(false);
  const [recordedMood, setRecordedMood] = useState('');
  const [moodSuccess, setMoodSuccess] = useState('');

  // Gentle interactive breathing guide
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathePhase, setBreathePhase] = useState('Inhale');
  const [breatheSeconds, setBreatheSeconds] = useState(4);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      if (res?.today_mood?.mood) {
        setRecordedMood(res.today_mood.mood);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Breathing exercise timer
  useEffect(() => {
    let interval = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreatheSeconds((prev) => {
          if (prev > 1) return prev - 1;
          setBreathePhase((currentPhase) => {
            if (currentPhase === 'Inhale') return 'Hold';
            if (currentPhase === 'Hold') return 'Exhale';
            return 'Inhale';
          });
          return 4;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  const handleRecordMood = async (moodValue) => {
    try {
      setSubmittingMood(true);
      await api.recordMood(moodValue, '');
      setRecordedMood(moodValue);
      setMoodSuccess(`Recorded feeling "${moodValue}". Take care of yourself today.`);
      setTimeout(() => setMoodSuccess(''), 4000);
      loadDashboard();
    } catch (err) {
      alert(err.message || 'Error recording mood');
    } finally {
      setSubmittingMood(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
        <p className="text-xs text-[#78817D] font-medium">Preparing your wellness space...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200 text-rose-800 text-xs">
        <div className="font-semibold mb-1">Notice</div>
        <p>{error}</p>
      </div>
    );
  }

  const studentName = user?.display_name || data?.user_name || 'Alex';

  return (
    <div className="space-y-10 pb-16 font-sans text-[#293B38]">
      
      {/* 1. GREETING & MOOD CHECK-IN */}
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
            Hello, {studentName}
          </h1>
          <p className="text-sm sm:text-base text-[#78817D] mt-1 font-normal">
            How are you feeling today?
          </p>
        </div>

        {/* Small, rounded muted mood buttons */}
        <div className="pt-1">
          <MoodSelector
            selectedMood={recordedMood}
            onSelect={handleRecordMood}
            disabled={submittingMood}
          />
        </div>

        {moodSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-medium animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#294A40]" />
            <span>{moodSuccess}</span>
          </div>
        )}
      </section>

      {/* 2. WELLNESS SUMMARY CARD & BREATHING EXERCISE CARD */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Wellness Summary Card (Soft Sage Background) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#E9EDE2] border border-[#DCE5D5] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#294A40] uppercase tracking-wider">
                Wellness Reflection
              </span>
              <span className="w-2 h-2 rounded-full bg-[#294A40]" />
            </div>
            <h2 className="text-lg font-semibold text-[#293B38]">
              {data?.today_mood ? `Today you're feeling ${data.today_mood.mood.toLowerCase()}` : "Take a quiet moment to reflect"}
            </h2>
            <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
              {data?.latest_phq9 || data?.latest_gad7 ? (
                <>Your recent check-ins show you are actively caring for your mental wellbeing. Remember to take small breaks between classes.</>
              ) : (
                <>No screening check-in logged yet this month. Checking in periodically helps you notice subtle shifts in energy and stress.</>
              )}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs">
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1 font-medium text-[#294A40] hover:text-[#1F3831] transition-colors"
            >
              <span>View Screening Summary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[11px] text-[#78817D]">
              {data?.mood_history?.length || 0} mood logs
            </span>
          </div>
        </div>

        {/* Gentle Breathing Exercise Card (Pale Peach Background) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#FBF4EE] border border-[#F3D8C8] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#294A40] uppercase tracking-wider flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-[#294A40]" />
                Gentle Breathing
              </span>
              <span className="text-[11px] text-[#78817D]">Box 4-4-4</span>
            </div>
            <h2 className="text-lg font-semibold text-[#293B38]">
              {breathingActive ? `${breathePhase} gently (${breatheSeconds}s)` : "Settle your mind and breath"}
            </h2>
            <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
              When study pressure or racing thoughts appear, four slow intentional breaths help your nervous system return to a restful state.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#294A40] text-[#FBFAF6] hover:bg-[#1F3831] transition-colors"
            >
              {breathingActive ? 'Pause Exercise' : 'Begin 60-sec Pause'}
            </button>
            {breathingActive && (
              <span className="text-xs font-medium text-[#294A40] animate-pulse">
                Follow the circle...
              </span>
            )}
          </div>
        </div>

      </section>

      {/* 3. FOUR MAIN FEATURE CARDS ("Support, whenever you need it") */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#293B38] tracking-tight">
            Support, whenever you need it
          </h2>
          <p className="text-xs text-[#78817D] mt-0.5">
            Calm, confidential tools designed to assist you at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Talk to MindBridge AI */}
          <Link
            to="/chat"
            className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] hover:border-[#DCE5D5] hover:shadow-[0_4px_16px_rgba(41,59,56,0.04)] transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#DCE5D5]">
                <MessageSquare className="w-5 h-5 text-[#294A40]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#293B38] mb-1 group-hover:text-[#294A40]">
                Talk to MindBridge AI
              </h3>
              <p className="text-xs text-[#78817D] leading-relaxed">
                Your AI check-in companion.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-medium text-[#294A40]">
              <span>Open chat</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 2. Take a Screening */}
          <Link
            to="/assessments"
            className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] hover:border-[#DCE5D5] hover:shadow-[0_4px_16px_rgba(41,59,56,0.04)] transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#DCE5D5]">
                <ClipboardCheck className="w-5 h-5 text-[#294A40]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#293B38] mb-1 group-hover:text-[#294A40]">
                Take a Screening
              </h3>
              <p className="text-xs text-[#78817D] leading-relaxed">
                Understand your emotional wellbeing.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-medium text-[#294A40]">
              <span>PHQ-9 & GAD-7</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 3. Book a Counsellor */}
          <Link
            to="/counsellors"
            className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] hover:border-[#DCE5D5] hover:shadow-[0_4px_16px_rgba(41,59,56,0.04)] transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#DCE5D5]">
                <CalendarCheck className="w-5 h-5 text-[#294A40]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#293B38] mb-1 group-hover:text-[#294A40]">
                Book a Counsellor
              </h3>
              <p className="text-xs text-[#78817D] leading-relaxed">
                Find professional support when needed.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-medium text-[#294A40]">
              <span>View slots</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 4. Explore Resources */}
          <Link
            to="/resources"
            className="p-5 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] hover:border-[#DCE5D5] hover:shadow-[0_4px_16px_rgba(41,59,56,0.04)] transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center mb-4 transition-colors group-hover:bg-[#DCE5D5]">
                <Library className="w-5 h-5 text-[#294A40]" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-[#293B38] mb-1 group-hover:text-[#294A40]">
                Explore Self-Help Resources
              </h3>
              <p className="text-xs text-[#78817D] leading-relaxed">
                Small steps toward feeling better.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1 text-[11px] font-medium text-[#294A40]">
              <span>Read articles</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* 4. UPCOMING APPOINTMENTS & RECENT MOOD HISTORY (If available) */}
      {data?.upcoming_appointments && data.upcoming_appointments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#293B38]">
            Upcoming Appointments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.upcoming_appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#293B38]">
                      Consultation with {appt.counsellor?.display_name || 'Campus Counsellor'}
                    </div>
                    <div className="text-[11px] text-[#78817D]">
                      {appt.slot ? `${appt.slot.date} at ${appt.slot.start_time}` : 'Confirmed'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40] capitalize">
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. GENTLE CLOSING REASSURANCE */}
      <section className="p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] text-center space-y-2">
        <p className="text-xs text-[#78817D]">
          "Self-care is not a one-time event, but a gentle daily practice."
        </p>
        <p className="text-[11px] text-[#969D97]">
          MindBridge AI • Confidential Student Support
        </p>
      </section>

    </div>
  );
};
