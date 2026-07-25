import React from 'react';
import { Star, MapPin, Video, UserCheck, Calendar, Stethoscope } from 'lucide-react';

export const DoctorCard = ({ doctor, onBook }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80';
  const ratingValue = (doctor?.rating || 4.8).toFixed(1);
  const consultationTypes = Array.isArray(doctor?.consultationTypes) ? doctor.consultationTypes : ['Both'];

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group border border-slate-800">
      {/* Glow Top Accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>

      <div>
        {/* Top Header: Image, Specialization, Rating */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={doctor?.imageUrl || defaultImage}
              alt={doctor?.name || 'Jaipur Specialist'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-md group-hover:border-teal-500/50 transition-colors bg-slate-900"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-slate-900" title="Live Available"></span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="inline-block px-2.5 py-0.5 bg-teal-500/10 text-teal-300 text-[11px] font-semibold rounded-full border border-teal-500/20">
                {doctor?.specialization || 'General Physician'}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{ratingValue}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-100 mt-1 truncate group-hover:text-teal-300 transition-colors">
              {doctor?.name || 'Dr. Specialist'}
            </h3>
            <p className="text-xs text-slate-400 truncate">{doctor?.qualification || 'MBBS, MD'}</p>
          </div>
        </div>

        {/* Hospital Affiliation & Locality in Jaipur */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-3 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-200">{doctor?.hospital?.name || 'Sawai Man Singh (SMS) Hospital'}</strong>
            {doctor?.hospital?.locality ? ` (${doctor.hospital.locality})` : ' (Jaipur)'}
          </span>
        </div>

        {/* Bio excerpt */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {doctor?.bio || 'Experienced Jaipur specialist providing expert patient diagnosis and healthcare treatment.'}
        </p>

        {/* Consultation Types Supported */}
        <div className="flex items-center gap-2 mb-4">
          {consultationTypes.includes('Online') || consultationTypes.includes('Both') ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              <Video className="w-3 h-3 text-cyan-400" /> Online Video/Chat
            </span>
          ) : null}
          {consultationTypes.includes('Offline') || consultationTypes.includes('Both') ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              <UserCheck className="w-3 h-3 text-emerald-400" /> In-Person Physical
            </span>
          ) : null}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-mono">Fee</span>
          <span className="text-base font-extrabold text-white">₹{doctor?.consultationFee || 500}</span>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition-all hover:scale-105"
        >
          <Calendar className="w-3.5 h-3.5" /> Book Slot
        </button>
      </div>
    </div>
  );
};
