import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorAPI, hospitalAPI } from '../services/api';
import { DoctorCard } from '../components/DoctorCard';
import { BookingModal } from '../components/BookingModal';
import { Search, Filter, Stethoscope, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const DoctorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('spec') || 'All');
  const [maxFee, setMaxFee] = useState('2000');
  const [hospitalId, setHospitalId] = useState('');
  const [consultationType, setConsultationType] = useState('All');

  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [specsRes, hospsRes] = await Promise.all([
          doctorAPI.getSpecializations(),
          hospitalAPI.getHospitals()
        ]);
        setSpecializations(['All', ...specsRes.data]);
        setHospitals(hospsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getDoctors({
        search,
        specialization: specialization !== 'All' ? specialization : undefined,
        maxFee,
        hospitalId: hospitalId || undefined,
        consultationType: consultationType !== 'All' ? consultationType : undefined
      });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, maxFee, hospitalId, consultationType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSpecialization('All');
    setMaxFee('2000');
    setHospitalId('');
    setConsultationType('All');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Jaipur Doctor Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter by specialization, consultation fee, Jaipur hospital, and Online vs Offline mode.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, specialization..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1 shrink-0"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Doctor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-6 h-fit">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-400" /> Filter Doctors
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-400 hover:text-teal-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Jaipur Hospital</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.locality})
                </option>
              ))}
            </select>
          </div>

          {/* Consultation Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Consultation Mode</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['All', 'Online', 'Offline'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setConsultationType(mode)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    consultationType === mode
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Max Consultation Fee Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Max Consultation Fee</span>
              <span className="text-teal-400 font-bold">₹{maxFee}</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="50"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹300</span>
              <span>₹2000</span>
            </div>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-900 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3 border border-slate-800">
              <Stethoscope className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Jaipur Doctors Found</h3>
              <p className="text-xs">Try adjusting your specialization or fee range filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-800 text-teal-400 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  onBook={(doc) => setSelectedDoctor(doc)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
};
