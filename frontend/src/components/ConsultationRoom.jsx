import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { Send, X, Video, ShieldCheck, User, Stethoscope, FileText, CheckCircle2 } from 'lucide-react';

export const ConsultationRoom = ({ appointmentId, onClose }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchAppointmentDetails = async () => {
    try {
      const res = await appointmentAPI.getById(appointmentId);
      setAppointment(res.data);
      if (res.data.chatHistory) {
        setMessages(res.data.chatHistory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  useEffect(() => {
    if (!socket || !appointmentId || !user) return;

    // Join appointment room
    socket.emit('join_appointment_room', {
      appointmentId,
      userId: user._id
    });

    const handleLoadHistory = (history) => {
      setMessages(history);
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleStatusChanged = ({ status }) => {
      setAppointment((prev) => (prev ? { ...prev, status } : prev));
    };

    socket.on('load_chat_history', handleLoadHistory);
    socket.on('receive_chat_message', handleReceiveMessage);
    socket.on('appointment_status_changed', handleStatusChanged);

    return () => {
      socket.off('load_chat_history', handleLoadHistory);
      socket.off('receive_chat_message', handleReceiveMessage);
      socket.off('appointment_status_changed', handleStatusChanged);
    };
  }, [socket, appointmentId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket) return;

    const senderRole = user.role === 'doctor' ? 'doctor' : 'patient';
    const senderName = user.name;

    socket.emit('send_chat_message', {
      appointmentId,
      senderRole,
      senderName,
      message: inputMsg.trim()
    });

    setInputMsg('');
  };

  const handleQuickNote = (note) => {
    if (!socket) return;
    socket.emit('send_chat_message', {
      appointmentId,
      senderRole: user.role === 'doctor' ? 'doctor' : 'patient',
      senderName: user.name,
      message: note
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="text-teal-400 font-semibold animate-pulse text-sm">
          Loading Live Consultation Room...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Room Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Consultation Room #{appointmentId.slice(-6).toUpperCase()}
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {appointment?.status || 'Confirmed'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{appointment?.patient?.name}</strong> • Doctor: <strong className="text-slate-200">Dr. {appointment?.doctor?.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Symptoms Summary Banner */}
        {appointment?.symptomsNotes && (
          <div className="bg-slate-800/40 px-4 py-2 border-b border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong>Patient Symptoms:</strong> {appointment.symptomsNotes}</span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <ShieldCheck className="w-8 h-8 text-teal-500/40" />
              <p>Real-time encrypted WebSocket consultation active.</p>
              <p>Type a message below to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe =
                (user.role === 'doctor' && msg.senderRole === 'doctor') ||
                (user.role === 'patient' && msg.senderRole === 'patient');

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {msg.senderName} ({msg.senderRole === 'doctor' ? 'Doctor' : 'Patient'})
                    </span>
                    <span>•</span>
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>

                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prescription / Shortcuts for Doctors */}
        {user.role === 'doctor' && (
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Quick Prescribe:</span>
            <button
              onClick={() => handleQuickNote('📋 Prescription: Tab Paracetamol 500mg BD after food for 3 days.')}
              className="px-2.5 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-500/20 shrink-0"
            >
              + Paracetamol 500mg
            </button>
            <button
              onClick={() => handleQuickNote('📋 Prescription: Cetirizine 10mg OD at bedtime for allergic skin rash.')}
              className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 shrink-0"
            >
              + Cetirizine 10mg
            </button>
            <button
              onClick={() => handleQuickNote('💧 Advice: Drink 3L of water daily and rest for 48 hours.')}
              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 shrink-0"
            >
              + Hydration Advice
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your medical query or response..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
