import React, { useState } from 'react';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { Calendar as CalendarIcon, Clock, Video, UserCheck, AlertCircle, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BookingModal = ({ doctor, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(
    doctor.availabilitySlots?.[0]?.times?.[0] || '10:00 AM - 10:30 AM'
  );
  const [type, setType] = useState('Online');
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-teal-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
          <p className="text-xs text-slate-300 mb-6">
            Please log in or create a patient account to book an appointment with Dr. {doctor.name}.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="flex-1 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-teal-400"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await appointmentAPI.create({
        doctorId: doctor._id,
        date: selectedDate,
        timeslot: selectedSlot,
        type,
        symptomsNotes
      });

      setCreatedAppointment(res.data);
      setShowPaymentModal(true);
    } catch (err) {
      alert('Error creating appointment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onClose();
    navigate('/dashboard');
  };

  if (showPaymentModal && createdAppointment) {
    return (
      <PaymentModal
        appointment={createdAppointment}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Banner */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <img
            src={doctor.imageUrl}
            alt={doctor.name}
            className="w-14 h-14 rounded-xl object-cover border border-teal-500/30"
          />
          <div>
            <h3 className="text-base font-bold text-white">{doctor.name}</h3>
            <p className="text-xs text-teal-400 font-medium">{doctor.specialization}</p>
            <p className="text-xs text-slate-400">{doctor.hospital?.name} (Jaipur)</p>
          </div>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-5">
          {/* Consultation Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('Online')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  type === 'Online'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Video className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Online Consultation</div>
                  <div className="text-[10px] text-slate-400">Video / Real-time Chat</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('Offline')}
                className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  type === 'Offline'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Offline In-Person</div>
                  <div className="text-[10px] text-slate-400">Hospital Visit</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Timeslot Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Timeslot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(doctor.availabilitySlots?.[0]?.times || [
                '09:00 AM - 09:30 AM',
                '10:00 AM - 10:30 AM',
                '02:00 PM - 02:30 PM',
                '04:00 PM - 04:30 PM'
              ]).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
                    selectedSlot === slot
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                      : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot}
                  </span>
                  {selectedSlot === slot && <Check className="w-3.5 h-3.5 text-teal-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Symptoms / Reason for Visit (Optional)
            </label>
            <textarea
              rows={2}
              value={symptomsNotes}
              onChange={(e) => setSymptomsNotes(e.target.value)}
              placeholder="e.g. Mild fever, dry cough, skin allergy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Submit & Fee summary */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Payable</span>
              <span className="text-xl font-extrabold text-teal-400">₹{doctor.consultationFee}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
