import React, { useEffect, useState } from 'react';
import { hospitalAPI } from '../services/api';
import { Building2, MapPin, PhoneCall, Star, ShieldAlert, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await hospitalAPI.getHospitals();
        setHospitals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-teal-400" /> Jaipur Super-Specialty Hospital Network
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore iconic medical centers in Jaipur with emergency trauma centers and OPD scheduling.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-900 rounded-2xl border border-slate-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {hospitals.map((hospital) => (
            <div
              key={hospital._id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Hospital Image & Badge Header */}
                <div className="relative h-48">
                  <img
                    src={hospital.imageUrl}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-teal-300 backdrop-blur-md">
                    {hospital.locality}, Jaipur
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <h3 className="text-xl font-extrabold text-white shadow-sm">{hospital.name}</h3>
                    <div className="flex items-center gap-1 bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {hospital.rating}
                    </div>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-4 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </div>

                  {/* Departments */}
                  <div>
                    <span className="font-semibold text-slate-400 block mb-2">Key Departments:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.departments.map((dept) => (
                        <span
                          key={dept}
                          className="px-2.5 py-1 bg-slate-800 text-slate-200 text-[11px] rounded-lg border border-slate-700"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-400" /> Contact: {hospital.contactPhone}
                  </div>
                  <div className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Emergency Hotline: {hospital.emergencyPhone}
                  </div>
                </div>

                <Link
                  to={`/doctors?hospitalId=${hospital._id}`}
                  className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Users className="w-3.5 h-3.5" /> View Doctors
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
