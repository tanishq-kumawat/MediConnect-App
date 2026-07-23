import { prisma } from '../config/db.js';

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            consultationFee: true,
            rating: true,
            imageUrl: true,
            qualification: true
          }
        }
      }
    });

    const formatted = hospitals.map((h) => ({
      ...h,
      _id: h.id,
      doctors: h.doctors.map((d) => ({ ...d, _id: d.id }))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: req.params.id },
      include: { doctors: true }
    });

    if (hospital) {
      res.json({
        ...hospital,
        _id: hospital.id,
        doctors: hospital.doctors.map((d) => ({ ...d, _id: d.id }))
      });
    } else {
      res.status(404).json({ message: 'Hospital not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
