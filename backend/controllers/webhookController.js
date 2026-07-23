import Appointment from '../models/Appointment.js';

export const handlePaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`[PAYMENT WEBHOOK RECEIVED] Event: ${event}`, data);

    if (event === 'payment_intent.succeeded' || event === 'payment.success') {
      const { appointmentId, transactionId, amountPaid } = data;

      const appointment = await Appointment.findById(appointmentId)
        .populate('doctor')
        .populate('hospital')
        .populate('patient', 'name email');

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      appointment.status = 'Confirmed';
      appointment.feePaid = true;
      appointment.transactionId = transactionId || `TXN_JAIPUR_${Date.now()}`;
      await appointment.save();

      // Emit WebSocket alerts to connected clients
      if (req.io) {
        req.io.to(`appointment_${appointmentId}`).emit('payment_confirmed', {
          appointmentId,
          transactionId: appointment.transactionId,
          status: 'Confirmed',
          message: 'Payment received successfully! Appointment confirmed.'
        });

        req.io.emit('user_notification', {
          userId: appointment.patient._id,
          title: 'Payment Successful',
          message: `Your appointment with Dr. ${appointment.doctor.name} on ${appointment.date} at ${appointment.timeslot} has been CONFIRMED.`,
          appointmentId: appointment._id
        });
      }

      return res.json({
        success: true,
        message: 'Webhook processed successfully. Appointment confirmed.',
        appointmentId: appointment._id,
        status: appointment.status
      });
    }

    res.json({ success: true, message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
