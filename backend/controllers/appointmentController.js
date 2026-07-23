import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeslot, type, symptomsNotes } = req.body;

    const doctor = await Doctor.findById(doctorId).populate('hospital');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      hospital: doctor.hospital._id,
      date,
      timeslot,
      type,
      feeAmount: doctor.consultationFee,
      feePaid: false,
      status: 'Pending',
      symptomsNotes: symptomsNotes || ''
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor')
      .populate('hospital')
      .populate('patient', 'name email phone');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        populate: { path: 'hospital', select: 'name locality address' }
      })
      .populate('hospital')
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email phone medicalHistory')
      .populate('hospital')
      .sort({ date: 1, timeslot: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(id)
      .populate('doctor')
      .populate('hospital')
      .populate('patient', 'name email');

    // Notify via Socket.io if IO attached to req
    if (req.io) {
      req.io.to(`appointment_${id}`).emit('appointment_status_changed', {
        appointmentId: id,
        status: updated.status,
        updatedAt: updated.updatedAt
      });
      req.io.emit('global_appointment_update', {
        appointmentId: id,
        patientId: updated.patient._id,
        status: updated.status
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor')
      .populate('hospital')
      .populate('patient', 'name email phone medicalHistory');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
