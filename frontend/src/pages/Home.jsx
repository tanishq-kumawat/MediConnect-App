import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI, hospitalAPI } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { BookingModal } from '../components/BookingModal';
import {
  Stethoscope,
  Search,
  Building2,
  Video,
  Bot,
  ShieldCheck,
  Zap,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Activity,
  Award
} from 'lucide-react';

export const Home = ({ onOpenTriage }) => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, hospRes] = await Promise.all([
          doctorAPI.getDoctors({}),
          hospitalAPI.getHospitals()
        ]);
        setDoctors(docRes.data.slice(0, 6));
        setHospitals(hospRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16">
        {/* Animated Background Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-teal-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -top-24 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/90 border border-teal-500/40 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-500/10 animate-float-slow">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Jaipur’s Premier MERN Healthcare Network</span>
          </div>

          {/* Animated Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            Real-Time Doctor Appointments &{' '}
            <span className="bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
              AI Medical Triage
            </span>{' '}
            in Jaipur
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect instantly with top specialists across iconic hospitals like <strong>SMS Hospital</strong>, <strong>Fortis Escorts</strong>, <strong>Eternal EHCC</strong>, and <strong>SDMH Jaipur</strong>. Experience WebSockets live consultations & webhook-verified bookings.
          </p>

          {/* Action CTAs with Hover Animations */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/doctors"
              className="group relative overflow-hidden px-7 py-3.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-teal-500/25 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Find Jaipur Doctors</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <button
              onClick={onOpenTriage}
              className="group px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl font-extrabold text-sm flex items-center gap-2.5 transition-all duration-300 hover:scale-105 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              <Bot className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
              <span>AI Symptom Checker</span>
            </button>
          </div>

          {/* Quick Stats Grid with Hover & Staggered Floating */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="glass-card glass-card-hover p-4.5 rounded-2xl text-center animate-float">
              <div className="text-3xl font-extrabold text-teal-400 flex items-center justify-center gap-1">
                <Building2 className="w-5 h-5 text-teal-400" /> 5+
              </div>
              <div className="text-xs font-medium text-slate-300 mt-1">Super Hospitals</div>
            </div>

            <div className="glass-card glass-card-hover p-4.5 rounded-2xl text-center animate-float-slow">
              <div className="text-3xl font-extrabold text-cyan-400 flex items-center justify-center gap-1">
                <Award className="w-5 h-5 text-cyan-400" /> 12+
              </div>
              <div className="text-xs font-medium text-slate-300 mt-1">Jaipur Specialists</div>
            </div>

            <div className="glass-card glass-card-hover p-4.5 rounded-2xl text-center animate-float-delayed">
              <div className="text-3xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                <Activity className="w-5 h-5 text-emerald-400" /> 24/7
              </div>
              <div className="text-xs font-medium text-slate-300 mt-1">Live Consultations</div>
            </div>

            <div className="glass-card glass-card-hover p-4.5 rounded-2xl text-center animate-float">
              <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-5 h-5 text-amber-400" /> 100%
              </div>
              <div className="text-xs font-medium text-slate-300 mt-1">Instant Webhooks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Bar with Animated Hover Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Popular Specializations <Sparkles className="w-4 h-4 text-teal-400" />
            </h2>
            <p className="text-xs text-slate-400">Find doctors by specific medical department</p>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {[
            { name: 'General Physician', color: 'from-blue-500/20 via-slate-900 to-teal-500/20', text: 'text-blue-300' },
            { name: 'Dermatologist', color: 'from-pink-500/20 via-slate-900 to-rose-500/20', text: 'text-pink-300' },
            { name: 'Physiotherapist', color: 'from-emerald-500/20 via-slate-900 to-teal-500/20', text: 'text-emerald-300' },
            { name: 'Pediatrician', color: 'from-amber-500/20 via-slate-900 to-orange-500/20', text: 'text-amber-300' },
            { name: 'Cardiologist', color: 'from-red-500/20 via-slate-900 to-rose-500/20', text: 'text-red-300' },
            { name: 'Orthopedic', color: 'from-cyan-500/20 via-slate-900 to-blue-500/20', text: 'text-cyan-300' }
          ].map((spec) => (
            <Link
              key={spec.name}
              to={`/doctors?spec=${encodeURIComponent(spec.name)}`}
              className={`p-4.5 rounded-2xl bg-gradient-to-br ${spec.color} border border-slate-800 hover:border-teal-500/50 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 group`}
            >
              <Stethoscope className={`w-7 h-7 mx-auto mb-2.5 ${spec.text} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`} />
              <h4 className="text-xs font-extrabold text-slate-100 group-hover:text-teal-300 transition-colors">{spec.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">Top Rated Jaipur Doctors</h2>
            <p className="text-xs text-slate-400">Available for Online Video/Chat & Physical Visits</p>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-900/80 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id || doctor.id}
                doctor={doctor}
                onBook={(doc) => setSelectedDoctor(doc)}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Symptom Triage Hero Card with Animated Glow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 border border-teal-500/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl hover:border-cyan-400/60 transition-colors">
          <div className="space-y-4 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-xs font-bold border border-cyan-500/30 animate-pulse">
              <Bot className="w-4 h-4" /> Integrated Gemini AI Triage
            </div>
            <h3 className="text-2xl font-extrabold text-white leading-tight">
              Not sure which specialist you need? Ask our AI Triage Assistant
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Describe symptoms like fever, skin irritation, joint stiffness, or pediatric concerns. The AI instantly evaluates guidance and matches specialists from SMS Hospital, Fortis, EHCC, or SDMH Jaipur.
            </p>
            <button
              onClick={onOpenTriage}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" /> Start AI Triage Assistant Now
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="shrink-0 w-full md:w-80 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative z-10 group hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-teal-400 mb-3 border-b border-slate-800/80 pb-2">
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" /> Live AI Preview
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl text-slate-300 border border-slate-800">
                User: "I have a skin rash and redness"
              </div>
              <div className="bg-teal-950/80 border border-teal-500/40 p-2.5 rounded-xl text-teal-200 shadow-md">
                AI: "Recommended Specialization: <strong>Dermatologist</strong>. Found Dr. Priyanshu Shekhawat (Fortis Jaipur) & Dr. Meera Agarwal (SDMH)."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jaipur Hospitals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-white">Affiliated Super-Specialty Hospitals in Jaipur</h2>
          <p className="text-xs text-slate-400">Direct booking & physical OPD appointments available</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp._id || hosp.id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-teal-500/10 group"
            >
              <div className="relative overflow-hidden h-40">
                <img
                  src={hosp.imageUrl}
                  alt={hosp.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                <span className="absolute bottom-2.5 left-3 text-[10px] font-mono uppercase bg-slate-950/90 text-teal-300 px-2.5 py-1 rounded-lg border border-teal-500/30 backdrop-blur-md">
                  {hosp.locality}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 group-hover:rotate-45 transition-transform duration-300" /> {hosp.rating}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {hosp.name}
                </h3>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" /> {hosp.address}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">{hosp.doctors?.length || 3} Doctors</span>
                  <span className="text-red-400 font-extrabold flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 animate-pulse" /> ER: {hosp.emergencyPhone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal Popup */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
};
