import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res) => {
  try {
    const { specialization, maxFee, hospitalId, consultationType, search } = req.query;

    let filter = {};

    if (specialization && specialization !== 'All') {
      filter.specialization = specialization;
    }

    if (maxFee) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }

    if (hospitalId) {
      filter.hospital = hospitalId;
    }

    if (consultationType && consultationType !== 'All') {
      filter.consultationTypes = { $in: [consultationType, 'Both'] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(filter).populate('hospital', 'name address locality city rating');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('hospital');
    if (doctor) {
      res.json(doctor);
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
