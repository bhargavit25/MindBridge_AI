import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  CalendarCheck, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Sparkles,
  HeartHandshake,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const CounsellorsDirectoryPage = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [studentNote, setStudentNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      const data = await api.getCounsellors();
      setCounsellors(data || []);
    } catch (err) {
      console.warn('Error loading counsellors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const openBookingModal = (counsellor, slot) => {
    setSelectedCounsellor(counsellor);
    setSelectedSlot(slot);
    setStudentNote('');
    setBookingError('');
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      await api.bookAppointment(
        selectedCounsellor.id,
        selectedSlot.id,
        studentNote
      );
      setBookingSuccess(`Appointment confirmed with ${selectedCounsellor.display_name}. We look forward to supporting you.`);
      setSelectedSlot(null);
      setSelectedCounsellor(null);
      fetchCounsellors();
      setTimeout(() => setBookingSuccess(''), 5000);
    } catch (err) {
      setBookingError(err.message || 'This time slot is no longer available. Please select another slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-[#293B38] pb-12">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Campus Wellness Counsellors
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] max-w-2xl leading-relaxed">
          Connect with dedicated university counsellors for confidential, one-on-one guidance in a warm, welcoming setting.
        </p>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40] shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Counsellor Directory Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#294A40] animate-spin" />
        </div>
      ) : counsellors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {counsellors.map((c) => {
            const availableSlots = (c.available_slots || []).filter((s) => !s.is_booked);

            return (
              <div
                key={c.id}
                className="p-6 sm:p-7 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4 flex flex-col justify-between hover:border-[#DCE5D5] transition-all"
              >
                <div className="space-y-3">
                  {/* Name and Designation */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] flex items-center justify-center font-semibold text-sm uppercase shrink-0">
                      {c.display_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-[#293B38]">
                        {c.display_name}
                      </h3>
                      <p className="text-xs text-[#294A40] font-medium">
                        {c.designation || 'Campus Psychological Counsellor'}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {c.bio && (
                    <p className="text-xs text-[#78817D] leading-relaxed">
                      {c.bio}
                    </p>
                  )}

                  {/* Expertise Areas */}
                  {c.expertise_areas && c.expertise_areas.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-medium text-[#78817D] uppercase tracking-wider">
                        Areas of Expertise
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.expertise_areas.map((area, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Availability Slots */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-medium text-[#78817D] uppercase tracking-wider">
                      Upcoming Available Slots
                    </span>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.slice(0, 4).map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => openBookingModal(c, slot)}
                            className="p-2 rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] hover:bg-[#E9EDE2] hover:border-[#DCE5D5] text-[11px] text-left transition-all group"
                          >
                            <div className="font-semibold text-[#293B38] group-hover:text-[#294A40]">
                              {slot.date}
                            </div>
                            <div className="text-[10px] text-[#78817D] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#969D97]" />
                              <span>{slot.start_time} - {slot.end_time}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#969D97] italic py-1">
                        No upcoming slots currently open. Check back soon.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer note */}
                <div className="pt-3 border-t border-[#E5E8DF] text-[11px] text-[#78817D] flex items-center justify-between">
                  <span>Free & Confidential Session</span>
                  <span className="font-medium text-[#294A40]">30–50 mins</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#78817D] rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF]">
          No counsellor profiles currently available.
        </div>
      )}

      {/* Friendly Booking Modal */}
      {selectedSlot && selectedCounsellor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#294A40]/30 backdrop-blur-sm">
          <div className="bg-[#FBFAF6] border border-[#E5E8DF] rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-4 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E8DF]">
              <div>
                <h3 className="font-semibold text-sm text-[#293B38]">
                  Reserve Consultation
                </h3>
                <p className="text-xs text-[#78817D]">
                  with {selectedCounsellor.display_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1 rounded-full text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Slot Recap */}
            <div className="p-3 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-xs space-y-1">
              <div className="font-semibold text-[#294A40]">
                {selectedSlot.date}
              </div>
              <div className="text-[#78817D] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#294A40]" />
                <span>{selectedSlot.start_time} – {selectedSlot.end_time}</span>
              </div>
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#78817D] mb-1">
                  Optional note for your counsellor:
                </label>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Share anything you'd like to discuss (e.g. academic stress, sleep troubles, or feeling overwhelmed)..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSlot(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Reserving...' : 'Confirm Consultation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
