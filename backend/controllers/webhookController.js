import { prisma } from '../config/db.js';

export const handlePaymentWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`[PAYMENT WEBHOOK RECEIVED] Event: ${event}`, data);

    if (event === 'payment_intent.succeeded' || event === 'payment.success') {
      const { appointmentId, transactionId } = data;

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          doctor: true,
          hospital: true,
          patient: { select: { id: true, name: true, email: true } }
        }
      });

      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'Confirmed',
          feePaid: true,
          transactionId: transactionId || `TXN_JAIPUR_${Date.now()}`
        },
        include: {
          doctor: true,
          hospital: true,
          patient: { select: { id: true, name: true, email: true } }
        }
      });

      if (req.io) {
        req.io.to(`appointment_${appointmentId}`).emit('payment_confirmed', {
          appointmentId,
          transactionId: updated.transactionId,
          status: 'Confirmed',
          message: 'Payment received successfully! Appointment confirmed.'
        });

        req.io.emit('user_notification', {
          userId: updated.patient.id,
          title: 'Payment Successful',
          message: `Your appointment with Dr. ${updated.doctor.name} on ${updated.date} at ${updated.timeslot} has been CONFIRMED.`,
          appointmentId: updated.id
        });
      }

      return res.json({
        success: true,
        message: 'Webhook processed successfully. Appointment confirmed.',
        appointmentId: updated.id,
        status: updated.status
      });
    }

    res.json({ success: true, message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
