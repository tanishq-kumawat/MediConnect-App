import React, { useEffect, useState } from 'react';
import { adminAPI, doctorAPI, hospitalAPI, appointmentAPI } from '../services/api';
import {
  ShieldAlert,
  Users,
  Building2,
  Stethoscope,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  FileText,
  Activity
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, doctors, hospitals, appointments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);

  // Form states
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: 'General Physician',
    hospitalId: '',
    consultationFee: 500,
    qualification: 'MBBS, MD',
    bio: ''
  });

  const [newHospital, setNewHospital] = useState({
    name: '',
    address: '',
    locality: 'C-Scheme',
    contactPhone: '+91 141 2500000',
    emergencyPhone: '108'
  });

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, docRes, hospRes] = await Promise.all([
        adminAPI.getStats(),
        doctorAPI.getDoctors({}),
        hospitalAPI.getHospitals()
      ]);
      setStats(statsRes.data);
      setDoctors(docRes.data);
      setHospitals(hospRes.data);
      if (hospRes.data.length > 0 && !newDoctor.hospitalId) {
        setNewDoctor((prev) => ({ ...prev, hospitalId: hospRes.data[0]._id || hospRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDoctor(newDoctor);
      setShowDoctorModal(false);
      setNewDoctor({
        name: '',
        specialization: 'General Physician',
        hospitalId: hospitals[0]?._id || hospitals[0]?.id || '',
        consultationFee: 500,
        qualification: 'MBBS, MD',
        bio: ''
      });
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating doctor profile');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the network?')) return;
    try {
      await adminAPI.deleteDoctor(id);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting doctor');
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createHospital(newHospital);
      setShowHospitalModal(false);
      setNewHospital({
        name: '',
        address: '',
        locality: 'C-Scheme',
        contactPhone: '+91 141 2500000',
        emergencyPhone: '108'
      });
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating hospital entry');
    }
  };

  const handleStatusOverride = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, newStatus);
      loadAdminData();
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-teal-400 font-bold flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span>Loading Admin System Metrics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              System Admin Control Center <Sparkles className="w-4 h-4 text-cyan-400" />
            </h1>
            <p className="text-xs text-slate-400">Jaipur MediConnect Healthcare System Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4 text-cyan-400" /> Swagger OpenAPI Specs <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={loadAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-300 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-4.5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Total Network Revenue</div>
            <div className="text-2xl font-extrabold text-teal-400 mt-1 flex items-center gap-1">
              ₹{stats.totalRevenue?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Confirmed Payments</div>
          </div>

          <div className="glass-card p-4.5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Registered Patients</div>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1">{stats.totalPatients || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Patient Accounts</div>
          </div>

          <div className="glass-card p-4.5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Jaipur Doctors</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.totalDoctors || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Active Specialists</div>
          </div>

          <div className="glass-card p-4.5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Super-Hospitals</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.totalHospitals || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Affiliated Centers</div>
          </div>

          <div className="glass-card p-4.5 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Total Bookings</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">{stats.totalAppointments || 0}</div>
            <div className="text-[10px] text-slate-500 mt-1">Appointments Created</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors ${
            activeTab === 'overview'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Recent Activity & Overview
        </button>
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 transition-colors ${
            activeTab === 'doctors'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Doctor Network ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`pb-3 transition-colors ${
            activeTab === 'hospitals'
              ? 'text-teal-400 border-b-2 border-teal-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Jaipur Hospitals ({hospitals.length})
        </button>
      </div>

      {/* TAB 1: Recent Activity & Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" /> Recent System Appointments
            </h3>

            {stats.recentAppointments?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent appointments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Doctor</th>
                      <th className="py-2.5 px-3">Hospital</th>
                      <th className="py-2.5 px-3">Date & Slot</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Action Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recentAppointments.map((app) => (
                      <tr key={app._id || app.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-3 font-semibold text-white">
                          {app.patient?.name || 'Rahul Sharma'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {app.doctor?.name || 'Dr. Specialist'}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {app.hospital?.name || 'Jaipur Center'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono">
                          {app.date} • {app.timeslot}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.status === 'Confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : app.status === 'Cancelled'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusOverride(app._id || app.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded text-[10px] text-white px-2 py-1 focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Doctors Management */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Network Specialists Management</h3>
            <button
              onClick={() => setShowDoctorModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Jaipur Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div key={doc._id || doc.id} className="glass-card p-4 rounded-2xl border border-slate-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <img src={doc.imageUrl} alt={doc.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{doc.name}</h4>
                    <p className="text-[11px] text-teal-400 font-medium">{doc.specialization}</p>
                    <p className="text-[10px] text-slate-400 truncate">{doc.hospital?.name} • ₹{doc.consultationFee}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDoctor(doc._id || doc.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg shrink-0"
                  title="Remove Doctor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Hospitals Management */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Affiliated Jaipur Super-Hospitals</h3>
            <button
              onClick={() => setShowHospitalModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Jaipur Hospital
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitals.map((hosp) => (
              <div key={hosp._id || hosp.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{hosp.name}</h4>
                  <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20 font-mono">
                    {hosp.locality}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{hosp.address}</p>
                <p className="text-[10px] text-red-400 font-bold">ER: {hosp.emergencyPhone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Doctor */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Add New Specialist Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  placeholder="Dr. Full Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {[
                    'General Physician',
                    'Dermatologist',
                    'Physiotherapist',
                    'Pediatrician',
                    'Cardiologist',
                    'Orthopedic',
                    'Neurologist',
                    'ENT Specialist'
                  ].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Hospital</label>
                <select
                  value={newDoctor.hospitalId}
                  onChange={(e) => setNewDoctor({ ...newDoctor, hospitalId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {hospitals.map((h) => (
                    <option key={h._id || h.id} value={h._id || h.id}>
                      {h.name} ({h.locality})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={newDoctor.consultationFee}
                  onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 text-slate-950 rounded-xl font-extrabold"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Hospital */}
      {showHospitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Add New Jaipur Hospital</h3>
            <form onSubmit={handleCreateHospital} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  placeholder="e.g. Apollo Hospital Jaipur"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  placeholder="Street / Road address"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Locality</label>
                <input
                  type="text"
                  required
                  value={newHospital.locality}
                  onChange={(e) => setNewHospital({ ...newHospital, locality: e.target.value })}
                  placeholder="e.g. Vaishali Nagar, Malviya Nagar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Emergency Hotline Phone</label>
                <input
                  type="text"
                  required
                  value={newHospital.emergencyPhone}
                  onChange={(e) => setNewHospital({ ...newHospital, emergencyPhone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHospitalModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 text-slate-950 rounded-xl font-extrabold"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
