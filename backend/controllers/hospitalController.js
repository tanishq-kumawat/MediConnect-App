import Hospital from '../models/Hospital.js';

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).populate({
      path: 'doctors',
      select: 'name specialization consultationFee rating imageUrl qualification'
    });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate('doctors');
    if (hospital) {
      res.json(hospital);
    } else {
      res.status(404).json({ message: 'Hospital not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
