import React, { useState } from 'react';
import { webhookAPI } from '../services/api';
import { CreditCard, CheckCircle, ShieldCheck, Zap, X, Loader2 } from 'lucide-react';

export const PaymentModal = ({ appointment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const handleSimulateWebhookPayment = async () => {
    setLoading(true);
    try {
      const transactionId = `TXN_JAIPUR_PAY_${Date.now()}`;
      const res = await webhookAPI.triggerPaymentWebhook(appointment._id, transactionId, appointment.feeAmount);
      
      if (res.data.success) {
        setTimeout(() => {
          setLoading(false);
          onSuccess(res.data);
        }, 1200);
      } else {
        alert('Webhook trigger failed: ' + res.data.message);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error triggering payment webhook.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-teal-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Payment Checkout</h3>
            <p className="text-xs text-slate-400">Jaipur Healthcare Gateway • SSL 256-bit Encrypted</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 mb-5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Doctor:</span>
            <span className="font-bold text-white">Dr. {appointment.doctor?.name}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Hospital:</span>
            <span className="text-slate-200">{appointment.hospital?.name}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Date & Slot:</span>
            <span className="text-teal-300 font-semibold">{appointment.date} | {appointment.timeslot}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Consultation Mode:</span>
            <span className="text-cyan-300 font-bold">{appointment.type}</span>
          </div>
          <div className="border-t border-slate-700/80 pt-2 flex justify-between text-sm">
            <span className="font-bold text-slate-200">Total Consultation Fee:</span>
            <span className="font-extrabold text-teal-400">₹{appointment.feeAmount}</span>
          </div>
        </div>

        {/* Mock Card Form */}
        <div className="space-y-3 mb-6 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Cardholder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Card Number (Test Mode)</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Trigger Webhook Pay Button */}
        <button
          onClick={handleSimulateWebhookPayment}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Payment & Triggering Webhook...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Pay ₹{appointment.feeAmount} & Trigger Payment Webhook</span>
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Webhook endpoint <code>/api/webhooks/payments</code> will verify event and update status.</span>
        </div>
      </div>
    </div>
  );
};
