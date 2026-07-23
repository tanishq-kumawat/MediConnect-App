import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { ConsultationRoom } from '../components/ConsultationRoom';
import { Stethoscope, Calendar, Video, CheckCircle, Clock, XCircle, RefreshCw, User, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultationId, setActiveConsultationId] = useState(null);

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      // Find doctor record for logged in doctor
      const doctorsRes = await doctorAPI.getDoctors({});
      const myDoctorRecord = doctorsRes.data.find((d) => d.name.toLowerCase().includes(user.name.toLowerCase())) || doctorsRes.data[0];

      if (myDoctorRecord) {
        const appRes = await appointmentAPI.getDoctorAppointments(myDoctorRecord._id);
        setAppointments(appRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((app) => (app._id === appointmentId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Doctor OPD Portal</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-400" /> Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage incoming patient consultations & live WebSockets room</p>
        </div>

        <button
          onClick={fetchDoctorQueue}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Incoming Patient Appointments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" /> Incoming Patient Queue ({appointments.length})
        </h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-slate-900 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-slate-400 space-y-2 border border-slate-800">
            <User className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">No patient consultations currently scheduled in your queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div
                key={app._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Patient: {app.patient?.name}</h3>
                    <p className="text-xs text-slate-400">
                      Email: {app.patient?.email} • Phone: {app.patient?.phone || '+91 98290 12345'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        app.status === 'Confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : app.status === 'Completed'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Patient Symptoms & History */}
                {app.symptomsNotes && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-teal-400 block mb-0.5">Stated Symptoms / Notes:</span>
                    <p>{app.symptomsNotes}</p>
                  </div>
                )}

                {/* Schedule Info */}
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
                    <span className="text-[10px] text-slate-400 block font-mono">Mode</span>
                    <span className="font-bold text-cyan-300">{app.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Fee Paid</span>
                    <span className="font-bold text-emerald-400">{app.feePaid ? 'Paid' : 'Unpaid'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Completed')}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" /> Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>

                  {app.type === 'Online' && (
                    <button
                      onClick={() => setActiveConsultationId(app._id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Video className="w-4 h-4" /> Open Consultation Room
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeConsultationId && (
        <ConsultationRoom
          appointmentId={activeConsultationId}
          onClose={() => setActiveConsultationId(null)}
        />
      )}
    </div>
  );
};
