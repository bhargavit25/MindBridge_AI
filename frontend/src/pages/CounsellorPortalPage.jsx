import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  CalendarCheck, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Users,
  Edit2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CounsellorPortalPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('10:00');
  const [slotEndTime, setSlotEndTime] = useState('10:45');
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [statusVal, setStatusVal] = useState('Confirmed');
  const [notice, setNotice] = useState('');

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const appts = await api.getAppointments();
      setAppointments(appts || []);
    } catch (err) {
      console.warn('Error loading portal data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!slotDate) {
      alert('Please select a date');
      return;
    }

    setCreatingSlot(true);
    try {
      const startDateTime = new Date(`${slotDate}T${slotStartTime}:00Z`);
      const endDateTime = new Date(`${slotDate}T${slotEndTime}:00Z`);

      await api.createSlot({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      });

      setNotice('New consultation time slot added.');
      setTimeout(() => setNotice(''), 4000);
      loadPortalData();
    } catch (err) {
      alert(err.message || 'Error creating slot.');
    } finally {
      setCreatingSlot(false);
    }
  };

  const handleUpdateStatus = async (appointmentId) => {
    try {
      await api.updateAppointmentStatus(appointmentId, statusVal, adminNote);
      setNotice(`Updated appointment status to ${statusVal}.`);
      setStatusUpdating(null);
      setAdminNote('');
      setTimeout(() => setNotice(''), 3000);
      loadPortalData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[#294A40] font-semibold text-xs uppercase tracking-wider">
          <Stethoscope className="w-4 h-4 text-[#294A40]" />
          <span>Campus Psychological Services</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Counsellor Portal
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] max-w-2xl leading-relaxed">
          Welcome, {user?.display_name}. Manage student consultations, appointment statuses, and your consultation availability.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Add New Availability Slot Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4">
        <h2 className="font-semibold text-sm text-[#293B38]">
          Add New Consultation Availability Slot
        </h2>
        <form onSubmit={handleCreateSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-[#78817D] mb-1">Date</label>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#78817D] mb-1">Start Time</label>
            <input
              type="time"
              value={slotStartTime}
              onChange={(e) => setSlotStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#78817D] mb-1">End Time</label>
            <input
              type="time"
              value={slotEndTime}
              onChange={(e) => setSlotEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={creatingSlot}
              className="w-full"
            >
              {creatingSlot ? 'Adding...' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        <h2 className="font-semibold text-sm text-[#293B38]">
          Scheduled Consultations
        </h2>

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
                  <div>
                    <h3 className="font-semibold text-sm text-[#293B38]">
                      Student: {a.student?.display_name || 'Alex Chen'}
                    </h3>
                    <div className="text-xs text-[#78817D] flex items-center gap-2 mt-0.5">
                      <span>{a.slot?.date}</span>
                      <span>•</span>
                      <span>{a.slot?.start_time} - {a.slot?.end_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40] capitalize border border-[#DCE5D5]">
                      {a.status}
                    </span>
                    <button
                      onClick={() => setStatusUpdating(statusUpdating === a.id ? null : a.id)}
                      className="px-3 py-1 text-xs text-[#294A40] hover:bg-[#E9EDE2] rounded-full border border-[#DCE5D5] transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {a.student_notes && (
                  <div className="p-3 rounded-2xl bg-[#E9EDE2]/40 text-xs text-[#78817D]">
                    <span className="font-medium text-[#293B38]">Student's Note: </span>
                    {a.student_notes}
                  </div>
                )}

                {/* Status Update Dropdown */}
                {statusUpdating === a.id && (
                  <div className="p-4 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-3 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <select
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38]"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Optional counsellor follow-up note..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38]"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(a.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF]">
            No appointments booked yet.
          </div>
        )}
      </div>

    </div>
  );
};
