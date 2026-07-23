import Doctor from '../models/Doctor.js';

export const handleSymptomTriage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Symptom message is required' });
    }

    const text = message.toLowerCase();

    // 1. Check Emergency Red Flags
    const emergencyKeywords = [
      'chest pain',
      'heart attack',
      'breathless',
      'can\'t breathe',
      'unconscious',
      'heavy bleeding',
      'stroke',
      'paralysis',
      'severe head injury'
    ];

    const isEmergency = emergencyKeywords.some((keyword) => text.includes(keyword));

    if (isEmergency) {
      return res.json({
        isEmergency: true,
        recommendation:
          '🚨 **EMERGENCY WARNING**: Your described symptoms sound critical. Please do not wait. Call emergency services immediately (Dial 108) or visit the nearest emergency room (e.g., SMS Hospital Trauma Center, JLN Marg, Jaipur).',
        specializationNeeded: 'Emergency Medicine',
        doctors: []
      });
    }

    // 2. Map Symptoms to Specialization
    let detectedSpec = 'General Physician';
    let guidance = '';

    if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('itching') || text.includes('eczema') || text.includes('pimples')) {
      detectedSpec = 'Dermatologist';
      guidance =
        'Based on your skin-related symptoms (rash/itching/irritation), avoid scratching the area and apply a cool moist compress. Avoid applying harsh chemical soaps.';
    } else if (text.includes('child') || text.includes('baby') || text.includes('kid') || text.includes('toddler') || text.includes('infant')) {
      detectedSpec = 'Pediatrician';
      guidance =
        'For pediatric concerns, keep the child well-hydrated, monitor temperature carefully, and avoid over-the-counter adult medications.';
    } else if (text.includes('joint') || text.includes('bone') || text.includes('fracture') || text.includes('knee') || text.includes('back pain') || text.includes('spine')) {
      detectedSpec = 'Orthopedic';
      guidance =
        'For joint or bone pain, practice gentle rest, ice packing (R.I.C.E protocol), and avoid heavy lifting until a specialist evaluates your condition.';
    } else if (text.includes('physio') || text.includes('muscle stiffness') || text.includes('posture') || text.includes('sprain') || text.includes('rehab')) {
      detectedSpec = 'Physiotherapist';
      guidance =
        'For muscle sprains or stiffness, gentle warm compresses and non-strenuous movement can ease tension.';
    } else if (text.includes('heart') || text.includes('palpitations') || text.includes('bp') || text.includes('blood pressure') || text.includes('cholesterol')) {
      detectedSpec = 'Cardiologist';
      guidance =
        'For cardiovascular symptoms or blood pressure fluctuations, avoid high sodium food, reduce stress, and ensure a prompt specialist review.';
    } else if (text.includes('headache') || text.includes('migraine') || text.includes('dizziness') || text.includes('numbness') || text.includes('nerve')) {
      detectedSpec = 'Neurologist';
      guidance =
        'For recurrent headaches or nerve sensations, stay hydrated in Jaipur heat, rest in a dark quiet room, and track pain frequency.';
    } else if (text.includes('ear') || text.includes('nose') || text.includes('throat') || text.includes('sinus') || text.includes('tonsils')) {
      detectedSpec = 'ENT Specialist';
      guidance =
        'For ear, nose, or throat irritation, warm saline gargles and steam inhalation can offer temporary relief.';
    } else {
      detectedSpec = 'General Physician';
      guidance =
        'For general malaise, mild fever, or flu symptoms, ensure plenty of oral fluids, rest, and monitor your vitals.';
    }

    // 3. Query 3 top matching doctors from the Jaipur database
    const doctors = await Doctor.find({ specialization: detectedSpec })
      .populate('hospital', 'name locality city')
      .limit(3);

    // If less than 3, fallback to General Physician or any doctor
    let finalDoctors = doctors;
    if (doctors.length < 3) {
      const additional = await Doctor.find({ specialization: { $ne: detectedSpec } })
        .populate('hospital', 'name locality city')
        .limit(3 - doctors.length);
      finalDoctors = [...doctors, ...additional];
    }

    return res.json({
      isEmergency: false,
      specializationNeeded: detectedSpec,
      guidance,
      disclaimer: '⚠️ Note: This AI Triage Assistant provides informational guidance only and is not a substitute for professional medical diagnosis.',
      doctors: finalDoctors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
