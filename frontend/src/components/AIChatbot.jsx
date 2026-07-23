import React, { useState, useRef, useEffect } from 'react';
import { triageAPI } from '../services/api';
import { Bot, Send, X, AlertTriangle, Stethoscope, ArrowRight, Sparkles, User, Calendar } from 'lucide-react';
import { BookingModal } from './BookingModal';

export const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI Medical Triage Assistant for Jaipur MediConnect. Describe your symptoms (e.g. "I have a skin rash and itching", "Mild fever", "Knee joint pain") and I will provide guidance & recommend relevant Jaipur doctors.',
      doctors: [],
      isEmergency: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userText) => {
    const query = userText || input;
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!userText) setInput('');
    setLoading(true);

    try {
      const res = await triageAPI.checkSymptoms(query);
      const data = res.data;

      let botText = '';
      if (data.isEmergency) {
        botText = data.recommendation;
      } else {
        botText = `${data.guidance}\n\nRecommended Specialization: **${data.specializationNeeded}**\n\n${data.disclaimer}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botText,
          doctors: data.doctors || [],
          isEmergency: data.isEmergency,
          specNeeded: data.specializationNeeded
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I ran into an issue analyzing your symptoms. Please try again or browse doctors directly.',
          doctors: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-full sm:w-96 h-[550px] bg-slate-900 border border-teal-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-teal-900/90 via-slate-900 to-cyan-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Symptom Triage <Sparkles className="w-3 h-3 text-cyan-400" />
              </h3>
              <p className="text-[10px] text-teal-300">Jaipur Doctor Referral Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Symptoms Chips */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span className="text-slate-400 shrink-0">Try:</span>
          <button
            onClick={() => handleSend('I have a skin rash and itching')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full shrink-0 border border-slate-700"
          >
            Skin Rash & Itching
          </button>
          <button
            onClick={() => handleSend('Knee joint pain and stiffness')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full shrink-0 border border-slate-700"
          >
            Knee Pain
          </button>
          <button
            onClick={() => handleSend('Severe chest pain and breathless')}
            className="px-2 py-0.5 bg-red-950/80 text-red-300 hover:bg-red-900 rounded-full shrink-0 border border-red-800/60 font-semibold"
          >
            Chest Pain (Test Emergency)
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/40 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3 rounded-2xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : msg.isEmergency
                    ? 'bg-red-950/90 border border-red-500/50 text-red-200 rounded-tl-none'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.isEmergency && (
                  <div className="flex items-center gap-1.5 font-bold text-red-400 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Emergency Alert
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Recommended Jaipur Doctors Cards */}
                {msg.doctors && msg.doctors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                    <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" /> Recommended Jaipur Specialists:
                    </div>
                    {msg.doctors.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={doc.imageUrl}
                            alt={doc.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-700"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-[11px] truncate">{doc.name}</h5>
                            <p className="text-[10px] text-slate-400 truncate">
                              {doc.hospital?.name} • ₹{doc.consultationFee}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedDoctorForBooking(doc)}
                          className="px-2.5 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[10px] rounded-lg shrink-0 flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" /> Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-teal-400 text-[11px] bg-slate-800/60 p-2.5 rounded-xl max-w-[70%]">
              <Bot className="w-4 h-4 animate-spin text-teal-400" />
              <span>Analyzing symptoms & querying Jaipur doctors...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe symptoms (e.g. fever, rash)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="p-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
        />
      )}
    </>
  );
};
