import Appointment from '../models/Appointment.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ [SOCKET CONNECTED] Socket ID: ${socket.id}`);

    // Join room for a specific appointment chat consultation
    socket.on('join_appointment_room', async ({ appointmentId, userId }) => {
      const room = `appointment_${appointmentId}`;
      socket.join(room);
      console.log(`User ${userId} joined room ${room}`);

      try {
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          socket.emit('load_chat_history', appointment.chatHistory || []);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    });

    // Handle incoming chat message in consultation room
    socket.on('send_chat_message', async ({ appointmentId, senderRole, senderName, message }) => {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (appointment) {
          const chatMsg = {
            senderRole,
            senderName,
            message,
            timestamp: new Date()
          };

          appointment.chatHistory.push(chatMsg);
          await appointment.save();

          const room = `appointment_${appointmentId}`;
          io.to(room).emit('receive_chat_message', chatMsg);
        }
      } catch (err) {
        console.error('Error handling chat message:', err);
      }
    });

    // Handle status change alert broadcasting
    socket.on('broadcast_status_change', ({ appointmentId, newStatus, patientId }) => {
      io.to(`appointment_${appointmentId}`).emit('appointment_status_changed', {
        appointmentId,
        status: newStatus
      });
      io.emit('user_notification', {
        userId: patientId,
        title: 'Appointment Status Updated',
        message: `Your appointment status is now: ${newStatus}`,
        appointmentId
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [SOCKET DISCONNECTED] Socket ID: ${socket.id}`);
    });
  });
};
