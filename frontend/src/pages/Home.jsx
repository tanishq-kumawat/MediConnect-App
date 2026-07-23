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
  PhoneCall
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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jaipur’s Premier MERN Healthcare Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Real-Time Doctor Appointments & <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI Medical Triage</span> in Jaipur
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect instantly with top specialists across iconic hospitals like <strong>SMS Hospital</strong>, <strong>Fortis Escorts</strong>, <strong>Eternal EHCC</strong>, and <strong>SDMH Jaipur</strong>. Experience WebSockets live consultations & webhook-verified bookings.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/doctors"
              className="px-6 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Search className="w-4 h-4" /> Find Jaipur Doctors
            </Link>

            <button
              onClick={onOpenTriage}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" /> AI Symptom Checker
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-teal-400">5+</div>
              <div className="text-xs text-slate-400">Jaipur Super-Hospitals</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-cyan-400">12+</div>
              <div className="text-xs text-slate-400">Expert Doctors</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-emerald-400">24/7</div>
              <div className="text-xs text-slate-400">WebSockets Consultation</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-extrabold text-amber-400">100%</div>
              <div className="text-xs text-slate-400">Automated Webhooks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Popular Specializations</h2>
            <p className="text-xs text-slate-400">Find doctors by specific medical department</p>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: 'General Physician', color: 'from-blue-500/20 to-teal-500/20', text: 'text-blue-300' },
            { name: 'Dermatologist', color: 'from-pink-500/20 to-rose-500/20', text: 'text-pink-300' },
            { name: 'Physiotherapist', color: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-300' },
            { name: 'Pediatrician', color: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-300' },
            { name: 'Cardiologist', color: 'from-red-500/20 to-rose-500/20', text: 'text-red-300' },
            { name: 'Orthopedic', color: 'from-cyan-500/20 to-blue-500/20', text: 'text-cyan-300' }
          ].map((spec) => (
            <Link
              key={spec.name}
              to={`/doctors?spec=${encodeURIComponent(spec.name)}`}
              className={`p-4 rounded-2xl bg-gradient-to-br ${spec.color} border border-slate-800 hover:border-teal-500/40 text-center transition-all hover:scale-105 group`}
            >
              <Stethoscope className={`w-6 h-6 mx-auto mb-2 ${spec.text} group-hover:scale-110 transition-transform`} />
              <h4 className="text-xs font-bold text-slate-100">{spec.name}</h4>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Top Rated Jaipur Doctors</h2>
            <p className="text-xs text-slate-400">Available for Online Video/Chat & Physical Visits</p>
          </div>
          <Link to="/doctors" className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onBook={(doc) => setSelectedDoctor(doc)}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Symptom Triage Hero Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 border border-teal-500/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/30">
              <Bot className="w-4 h-4" /> Integrated Medical Intelligence
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Not sure which specialist you need? Ask our AI Symptom Checker
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Describe symptoms like fever, skin irritation, joint stiffness, or pediatric concerns. The AI instantly evaluates non-emergency guidance and recommends top doctors from SMS Hospital, Fortis, EHCC, or SDMH Jaipur.
            </p>
            <button
              onClick={onOpenTriage}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> Start AI Triage Assistant Now
            </button>
          </div>

          <div className="shrink-0 w-full md:w-80 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-3 border-b border-slate-800 pb-2">
              <Bot className="w-4 h-4" /> Live AI Preview
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-800 p-2.5 rounded-xl text-slate-300">
                User: "I have a skin rash and redness"
              </div>
              <div className="bg-teal-950/70 border border-teal-500/30 p-2.5 rounded-xl text-teal-200">
                AI: "Recommended Specialization: <strong>Dermatologist</strong>. Found Dr. Priyanshu Shekhawat (Fortis Jaipur) & Dr. Meera Agarwal (SDMH)."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jaipur Hospitals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Affiliated Super-Specialty Hospitals in Jaipur</h2>
          <p className="text-xs text-slate-400">Direct booking & physical OPD appointments available</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div key={hosp._id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-teal-500/40 transition-all group">
              <img src={hosp.imageUrl} alt={hosp.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                    {hosp.locality}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {hosp.rating}
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {hosp.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" /> {hosp.address}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">{hosp.doctors?.length || 3} Doctors</span>
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" /> ER: {hosp.emergencyPhone}
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
