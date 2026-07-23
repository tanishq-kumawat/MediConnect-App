import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: String, required: true }, // Format YYYY-MM-DD
    timeslot: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    type: {
      type: String,
      enum: ['Online', 'Offline'],
      required: true
    },
    feePaid: { type: Boolean, default: false },
    feeAmount: { type: Number, required: true },
    transactionId: { type: String, default: '' },
    symptomsNotes: { type: String, default: '' },
    chatHistory: [
      {
        senderRole: { type: String, enum: ['patient', 'doctor'] },
        senderName: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
