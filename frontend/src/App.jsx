import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NotificationToast } from './components/NotificationToast';
import { AIChatbot } from './components/AIChatbot';

import { Home } from './pages/Home';
import { DoctorsPage } from './pages/DoctorsPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  const [isTriageOpen, setIsTriageOpen] = useState(false);

  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
            <Navbar onOpenTriage={() => setIsTriageOpen(true)} />
            <NotificationToast />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home onOpenTriage={() => setIsTriageOpen(true)} />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/hospitals" element={<HospitalsPage />} />
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>

            <AIChatbot isOpen={isTriageOpen} onClose={() => setIsTriageOpen(false)} />
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
