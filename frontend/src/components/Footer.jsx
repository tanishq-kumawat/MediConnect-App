import React from 'react';
import { Stethoscope, Heart, PhoneCall, ShieldAlert } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">
                Jaipur<span className="text-teal-400">MediConnect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Integrated MERN Healthcare platform bringing real-time doctor appointments, WebSockets consultation rooms, and AI triage to Jaipur residents.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Jaipur Network
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Top Jaipur Hospitals</h4>
            <ul className="space-y-2 text-xs">
              <li>SMS Hospital (JLN Marg)</li>
              <li>Fortis Escorts Jaipur</li>
              <li>Eternal Hospital (EHCC)</li>
              <li>Narayana Health (Pratap Nagar)</li>
              <li>SDMH (C-Scheme)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Specializations</h4>
            <ul className="space-y-2 text-xs">
              <li>General Physicians</li>
              <li>Dermatologists</li>
              <li>Pediatricians</li>
              <li>Cardiologists</li>
              <li>Physiotherapists & Rehab</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Jaipur Emergency Contacts</h4>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-4 h-4" /> Emergency Hotline: 108
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> SMS Hospital ER: +91 141 2560291
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" /> Fortis Jaipur ER: +91 141 2547001
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Jaipur MediConnect. Built with MongoDB, Express, React, Node.js, Socket.io & Tailwind CSS.</p>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Jaipur Healthcare
          </div>
        </div>
      </div>
    </footer>
  );
};
