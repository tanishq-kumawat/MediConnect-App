import { prisma } from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctorsCount,
      totalHospitalsCount,
      totalAppointmentsCount,
      confirmedAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.doctor.count(),
      prisma.hospital.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'Confirmed' } }),
      prisma.appointment.count({ where: { status: 'Pending' } }),
      prisma.appointment.count({ where: { status: 'Completed' } }),
      prisma.appointment.count({ where: { status: 'Cancelled' } })
    ]);

    const paidAppointments = await prisma.appointment.findMany({
      where: { feePaid: true },
      select: { feeAmount: true }
    });

    const totalRevenue = paidAppointments.reduce((sum, app) => sum + (app.feeAmount || 0), 0);

    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { select: { id: true, name: true, specialization: true } },
        hospital: { select: { id: true, name: true } }
      }
    });

    const formattedRecent = recentAppointments.map((a) => ({
      ...a,
      _id: a.id,
      patient: a.patient ? { ...a.patient, _id: a.patient.id } : null,
      doctor: a.doctor ? { ...a.doctor, _id: a.doctor.id } : null,
      hospital: a.hospital ? { ...a.hospital, _id: a.hospital.id } : null
    }));

    res.json({
      totalUsers,
      totalPatients,
      totalDoctors: totalDoctorsCount,
      totalHospitals: totalHospitalsCount,
      totalAppointments: totalAppointmentsCount,
      totalRevenue,
      appointmentsBreakdown: {
        confirmed: confirmedAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      recentAppointments: formattedRecent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDoctorByAdmin = async (req, res) => {
  try {
    const {
      name,
      specialization,
      hospitalId,
      consultationFee,
      consultationTypes,
      imageUrl,
      bio,
      qualification,
      experienceYears
    } = req.body;

    if (!name || !specialization || !hospitalId || !consultationFee) {
      return res.status(400).json({ message: 'Name, specialization, hospitalId, and fee are required' });
    }

    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Target Jaipur hospital not found' });
    }

    const standardSlots = [
      { day: 'Monday', times: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '02:00 PM - 02:30 PM'] },
      { day: 'Wednesday', times: ['10:00 AM - 10:30 AM', '12:00 PM - 12:30 PM', '04:00 PM - 04:30 PM'] },
      { day: 'Friday', times: ['10:30 AM - 11:00 AM', '02:00 PM - 02:30 PM', '05:00 PM - 05:30 PM'] }
    ];

    const newDoctor = await prisma.doctor.create({
      data: {
        name,
        specialization,
        hospitalId,
        consultationFee: Number(consultationFee),
        consultationTypes: consultationTypes || ['Both'],
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
        bio: bio || `Specialist in ${specialization} at ${hospital.name}.`,
        qualification: qualification || 'MBBS, MD',
        experienceYears: Number(experienceYears) || 10,
        availabilitySlots: standardSlots
      },
      include: { hospital: true }
    });

    res.status(201).json({
      ...newDoctor,
      _id: newDoctor.id,
      hospital: { ...newDoctor.hospital, _id: newDoctor.hospital.id }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoctorByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await prisma.doctor.delete({ where: { id } });
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHospitalByAdmin = async (req, res) => {
  try {
    const { name, address, locality, city, contactPhone, emergencyPhone, departments, imageUrl } = req.body;
    if (!name || !address || !locality || !contactPhone) {
      return res.status(400).json({ message: 'Name, address, locality, and contact phone are required' });
    }

    const hospital = await prisma.hospital.create({
      data: {
        name,
        address,
        locality,
        city: city || 'Jaipur',
        contactPhone,
        emergencyPhone: emergencyPhone || '108',
        departments: departments || ['General Medicine'],
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'
      }
    });

    res.status(201).json({ ...hospital, _id: hospital.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
