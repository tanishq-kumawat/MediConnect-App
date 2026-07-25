import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { ConsultationRoom } from '../components/ConsultationRoom';
import {
  Stethoscope,
  Calendar,
  Video,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  User,
  AlertCircle,
  Mail,
  Bell
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [notificationBanner, setNotificationBanner] = useState('');

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const doctorsRes = await doctorAPI.getDoctors({});
      const myDoctorRecord = doctorsRes.data.find((d) => d.name.toLowerCase().includes(user.name.toLowerCase())) || doctorsRes.data[0];

      if (myDoctorRecord) {
        const appRes = await appointmentAPI.getDoctorAppointments(myDoctorRecord._id || myDoctorRecord.id);
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

  // Listen for real-time incoming booking requests via WebSockets
  useEffect(() => {
    if (!socket) return;

    const handleNewBooking = (data) => {
      setNotificationBanner(`🔔 New Booking Request from ${data.patientName} for ${data.date} (${data.timeslot}). Email alert sent!`);
      fetchDoctorQueue();
    };

    socket.on('doctor_new_booking_request', handleNewBooking);
    socket.on('doctor_notification', (data) => {
      setNotificationBanner(`📩 ${data.message}`);
    });

    return () => {
      socket.off('doctor_new_booking_request', handleNewBooking);
    };
  }, [socket]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((app) => (app._id === appointmentId || app.id === appointmentId ? { ...app, status: newStatus } : app))
      );
      if (newStatus === 'Confirmed') {
        alert('✅ Timeslot Verified & Approved! Confirmation email and in-app notification sent to the patient.');
      }
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  const pendingRequests = appointments.filter((a) => a.status === 'Pending');
  const confirmedRequests = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">Doctor OPD Portal & Timeslot Verification</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-400" /> Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review incoming booking requests, verify slot availability & trigger automated email confirmations</p>
        </div>

        <button
          onClick={fetchDoctorQueue}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Real-time Notification Banner */}
      {notificationBanner && (
        <div className="p-4 bg-teal-950/90 border border-teal-500/50 rounded-2xl text-teal-200 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-3">
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400 animate-bounce" /> {notificationBanner}
          </span>
          <button onClick={() => setNotificationBanner('')} className="text-slate-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Pending Approval Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl text-amber-200 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> You have {pendingRequests.length} pending appointment request(s) awaiting timeslot verification.
          </span>
        </div>
      )}

      {/* Patient Appointments Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" /> Patient Queue & Slot Verification ({appointments.length})
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
            {appointments.map((app) => {
              const appId = app._id || app.id;
              const isPending = app.status === 'Pending';

              return (
                <div
                  key={appId}
                  className={`glass-card rounded-2xl p-5 border space-y-4 transition-all ${
                    isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Patient: {app.patient?.name || 'Rahul Sharma'}
                        {isPending && (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> Action Needed: Verify Slot
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-teal-400" /> {app.patient?.email} • Phone: {app.patient?.phone || '+91 98290 12345'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          app.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : app.status === 'Completed'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : app.status === 'Cancelled'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Patient Symptoms & Notes */}
                  {app.symptomsNotes && (
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="font-semibold text-teal-400 block mb-0.5">Patient Stated Symptoms / Notes:</span>
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
                      <span className="text-[10px] text-slate-400 block font-mono">Requested Timeslot</span>
                      <span className="font-bold text-slate-200">{app.timeslot}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Mode</span>
                      <span className="font-bold text-cyan-300">{app.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">Fee Amount</span>
                      <span className="font-bold text-emerald-400">₹{app.feeAmount}</span>
                    </div>
                  </div>

                  {/* Action Buttons: 2-Step Doctor Verification */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Confirmed')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4" /> Verify & Approve Timeslot
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Cancelled')}
                            className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline (Slot Unavailable)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Completed')}
                            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Clock className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appId, 'Cancelled')}
                            className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    {app.type === 'Online' && app.status === 'Confirmed' && (
                      <button
                        onClick={() => setActiveConsultationId(appId)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Video className="w-4 h-4" /> Open Consultation Room
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
