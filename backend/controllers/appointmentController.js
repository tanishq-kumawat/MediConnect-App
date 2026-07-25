import { prisma } from '../config/db.js';
import { sendBookingAlertToDoctor, sendConfirmationToPatient } from '../services/emailService.js';

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeslot, type, symptomsNotes } = req.body;
    const userId = req.user._id || req.user.id;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { hospital: true }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: userId,
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        date,
        timeslot,
        type,
        feeAmount: doctor.consultationFee,
        feePaid: false,
        status: 'Pending',
        symptomsNotes: symptomsNotes || '',
        chatHistory: []
      },
      include: {
        doctor: { include: { hospital: true } },
        hospital: true,
        patient: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    const formatted = {
      ...appointment,
      _id: appointment.id,
      patient: { ...appointment.patient, _id: appointment.patient.id },
      doctor: { ...appointment.doctor, _id: appointment.doctor.id, hospital: { ...appointment.doctor.hospital, _id: appointment.doctor.hospital.id } },
      hospital: { ...appointment.hospital, _id: appointment.hospital.id }
    };

    // 1. Emit Real-Time Socket.io Alert to Doctor's Portal Queue
    if (req.io) {
      req.io.emit('doctor_new_booking_request', {
        doctorId: doctor.id,
        appointmentId: appointment.id,
        patientName: appointment.patient.name,
        date,
        timeslot,
        type
      });
      req.io.emit('doctor_notification', {
        doctorId: doctor.id,
        title: 'New Appointment Booking Request',
        message: `Patient ${appointment.patient.name} requested an appointment on ${date} at ${timeslot}. Please verify timeslot availability.`,
        appointmentId: appointment.id
      });
    }

    // 2. Dispatch Email Notification to Doctor
    sendBookingAlertToDoctor({
      doctorEmail: doctor.email,
      doctorName: doctor.name,
      patientName: appointment.patient.name,
      date,
      timeslot,
      symptomsNotes,
      hospitalName: doctor.hospital.name,
      type
    });

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const appointments = await prisma.appointment.findMany({
      where: { patientId: userId },
      include: {
        doctor: { include: { hospital: true } },
        hospital: true,
        patient: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = appointments.map((a) => ({
      ...a,
      _id: a.id,
      patient: { ...a.patient, _id: a.patient.id },
      doctor: { ...a.doctor, _id: a.doctor.id, hospital: { ...a.doctor.hospital, _id: a.doctor.hospital.id } },
      hospital: { ...a.hospital, _id: a.hospital.id }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true, medicalHistory: true } },
        hospital: true,
        doctor: true
      },
      orderBy: [{ date: 'asc' }, { timeslot: 'asc' }]
    });

    const formatted = appointments.map((a) => ({
      ...a,
      _id: a.id,
      patient: { ...a.patient, _id: a.patient.id },
      doctor: { ...a.doctor, _id: a.doctor.id },
      hospital: { ...a.hospital, _id: a.hospital.id }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        doctor: { include: { hospital: true } },
        hospital: true,
        patient: { select: { id: true, name: true, email: true } }
      }
    });

    const formatted = {
      ...updated,
      _id: updated.id,
      patient: { ...updated.patient, _id: updated.patient.id },
      doctor: { ...updated.doctor, _id: updated.doctor.id, hospital: { ...updated.doctor.hospital, _id: updated.doctor.hospital.id } },
      hospital: { ...updated.hospital, _id: updated.hospital.id }
    };

    // 1. Emit Real-Time Socket.io Alert to Patient
    if (req.io) {
      req.io.to(`appointment_${id}`).emit('appointment_status_changed', {
        appointmentId: id,
        status: updated.status,
        updatedAt: updated.updatedAt
      });
      req.io.emit('user_notification', {
        userId: updated.patientId,
        title: status === 'Confirmed' ? 'Appointment Confirmed!' : `Appointment ${status}`,
        message: status === 'Confirmed'
          ? `Dr. ${updated.doctor.name} verified your timeslot and CONFIRMED your appointment on ${updated.date} at ${updated.timeslot}.`
          : `Your appointment status with Dr. ${updated.doctor.name} is now: ${status}.`,
        appointmentId: id
      });
    }

    // 2. Dispatch Email Notification to Patient
    sendConfirmationToPatient({
      patientEmail: updated.patient.email,
      patientName: updated.patient.name,
      doctorName: updated.doctor.name,
      hospitalName: updated.hospital.name,
      date: updated.date,
      timeslot: updated.timeslot,
      status: updated.status,
      type: updated.type
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        doctor: { include: { hospital: true } },
        hospital: true,
        patient: { select: { id: true, name: true, email: true, phone: true, medicalHistory: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const formatted = {
      ...appointment,
      _id: appointment.id,
      patient: { ...appointment.patient, _id: appointment.patient.id },
      doctor: { ...appointment.doctor, _id: appointment.doctor.id, hospital: { ...appointment.doctor.hospital, _id: appointment.doctor.hospital.id } },
      hospital: { ...appointment.hospital, _id: appointment.hospital.id }
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
