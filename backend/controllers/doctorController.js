import { prisma } from '../config/db.js';

export const getDoctors = async (req, res) => {
  try {
    const { specialization, maxFee, hospitalId, consultationType, search } = req.query;

    let whereClause = {};

    if (specialization && specialization !== 'All') {
      whereClause.specialization = specialization;
    }

    if (maxFee) {
      whereClause.consultationFee = { lte: Number(maxFee) };
    }

    if (hospitalId) {
      whereClause.hospitalId = hospitalId;
    }

    if (consultationType && consultationType !== 'All') {
      whereClause.consultationTypes = { hasSome: [consultationType, 'Both'] };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            locality: true,
            city: true,
            rating: true
          }
        }
      }
    });

    const formattedDoctors = doctors.map((d) => ({
      ...d,
      _id: d.id,
      hospital: d.hospital ? { ...d.hospital, _id: d.hospital.id } : null
    }));

    res.json(formattedDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      include: { hospital: true }
    });

    if (doctor) {
      res.json({
        ...doctor,
        _id: doctor.id,
        hospital: doctor.hospital ? { ...doctor.hospital, _id: doctor.hospital.id } : null
      });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSpecializations = async (req, res) => {
  try {
    const specs = [
      'General Physician',
      'Dermatologist',
      'Physiotherapist',
      'Pediatrician',
      'Cardiologist',
      'Orthopedic',
      'Neurologist',
      'ENT Specialist'
    ];
    res.json(specs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
