import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, authAPI } from '../services/api';
import { ConsultationRoom } from '../components/ConsultationRoom';
import { PaymentModal } from '../components/PaymentModal';
import { Calendar, Video, Clock, MapPin, Plus, FileText, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active consultation room state
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  // Payment modal state
  const [selectedAppointmentForPay, setSelectedAppointmentForPay] = useState(null);

  // New Medical History form
  const [condition, setCondition] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [appRes, userRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        authAPI.getProfile()
      ]);
      setAppointments(appRes.data);
      setMedicalHistory(userRes.data.medicalHistory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddMedicalHistory = async (e) => {
    e.preventDefault();
    if (!condition.trim()) return;
    try {
      const res = await authAPI.addMedicalHistory({ condition, diagnosedDate, notes });
      setMedicalHistory(res.data);
      setCondition('');
      setDiagnosedDate('');
      setNotes('');
    } catch (err) {
      alert('Failed to add record');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Completed':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Greeting Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">Patient Portal</span>
          <h1 className="text-2xl font-extrabold text-white">Welcome back, {user.name}!</h1>
          <p className="text-xs text-slate-400 mt-1">
            Email: {user.email} • Contact: {user.phone || '+91 98290 12345'}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Appointments List (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" /> Booked Appointments ({appointments.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-slate-900 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-400 space-y-2 border border-slate-800">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">You have no booked appointments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((app) => (
                <div
                  key={app._id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={app.doctor?.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80'}
                        alt={app.doctor?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">Dr. {app.doctor?.name}</h3>
                        <p className="text-xs text-teal-400 font-medium">{app.doctor?.specialization}</p>
                        <p className="text-[11px] text-slate-400">{app.hospital?.name} (Jaipur)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Date</span>
                      <span className="font-bold text-white">{app.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Timeslot</span>
                      <span className="font-bold text-slate-200">{app.timeslot}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Type</span>
                      <span className="font-bold text-cyan-300">{app.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Payment</span>
                      <span className={`font-bold ${app.feePaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {app.feePaid ? 'Paid (₹' + app.feeAmount + ')' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {app.type === 'Online' && (app.status === 'Confirmed' || app.status === 'Pending') ? (
                      <button
                        onClick={() => setActiveConsultationId(app._id)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Video className="w-4 h-4" /> Launch Consultation Room
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">In-Person Hospital OPD Appointment</span>
                    )}

                    {!app.feePaid && app.status !== 'Cancelled' && (
                      <button
                        onClick={() => setSelectedAppointmentForPay(app)}
                        className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Pay Fee & Confirm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medical History Sidebar (1 Column) */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-teal-400" /> Medical History & Allergies
            </h3>

            {/* List */}
            <div className="space-y-2 text-xs">
              {medicalHistory.length === 0 ? (
                <p className="text-slate-500">No medical history records logged yet.</p>
              ) : (
                medicalHistory.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between font-bold text-teal-300">
                      <span>{item.condition}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{item.diagnosedDate}</span>
                    </div>
                    {item.notes && <p className="text-slate-400 text-[11px]">{item.notes}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Add New Record Form */}
            <form onSubmit={handleAddMedicalHistory} className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Add Medical Record</span>
              <input
                type="text"
                placeholder="Condition / Allergy (e.g. Dust Allergy)"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                required
              />
              <input
                type="text"
                placeholder="Diagnosed Date (e.g. 2023)"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Notes / Inhaler / Prescriptions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Save Record
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Consultation Room Modal */}
      {activeConsultationId && (
        <ConsultationRoom
          appointmentId={activeConsultationId}
          onClose={() => setActiveConsultationId(null)}
        />
      )}

      {/* Payment Checkout Modal */}
      {selectedAppointmentForPay && (
        <PaymentModal
          appointment={selectedAppointmentForPay}
          onClose={() => setSelectedAppointmentForPay(null)}
          onSuccess={() => {
            setSelectedAppointmentForPay(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
