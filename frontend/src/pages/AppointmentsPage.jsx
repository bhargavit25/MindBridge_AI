import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CalendarCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointments();
      setAppointments(data || []);
    } catch (err) {
      console.warn('Error loading appointments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this consultation? Your time slot will be released.')) return;
    try {
      await api.cancelAppointment(id);
      setNotice('Appointment cancelled.');
      setTimeout(() => setNotice(''), 4000);
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Error cancelling appointment');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-[#E9EDE2] text-[#294A40] border-[#DCE5D5]';
      case 'Pending':
        return 'bg-[#FBF4EE] text-[#294A40] border-[#F3D8C8]';
      case 'Completed':
        return 'bg-[#E4ECF2] text-[#293B38] border-[#D5E1E9]';
      case 'Cancelled':
        return 'bg-[#FBFAF6] text-[#969D97] border-[#E5E8DF]';
      default:
        return 'bg-[#E9EDE2] text-[#294A40]';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
            My Consultations
          </h1>
          <p className="text-xs sm:text-sm text-[#78817D] mt-1">
            Review your upcoming and completed confidential counselling sessions.
          </p>
        </div>

        <Link to="/counsellors">
          <Button variant="primary" size="sm" icon={Plus}>
            Book New Session
          </Button>
        </Link>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40]" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
        </div>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.02)] space-y-3 hover:border-[#DCE5D5] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#294A40]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#293B38]">
                      Consultation with {a.counsellor?.display_name || 'Campus Counsellor'}
                    </h3>
                    <div className="text-xs text-[#78817D] flex items-center gap-2 mt-0.5">
                      <span>{a.slot?.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#969D97]" />
                        {a.slot?.start_time} - {a.slot?.end_time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(a.status)} capitalize`}>
                    {a.status}
                  </span>
                  {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="px-3 py-1 text-xs text-[#78817D] hover:text-rose-700 hover:bg-rose-50/60 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {a.student_notes && (
                <div className="p-3 rounded-2xl bg-[#E9EDE2]/40 text-xs text-[#78817D]">
                  <span className="font-medium text-[#293B38]">Your notes: </span>
                  {a.student_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-3">
          <p>You have no scheduled consultations.</p>
          <Link to="/counsellors">
            <Button variant="outline" size="sm">
              Explore Campus Counsellors
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
};
