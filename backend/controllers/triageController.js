import { GoogleGenerativeAI } from '@google/generative-ai';
import Doctor from '../models/Doctor.js';

// Helper for fallback rule-based triage if Gemini API is unavailable or fails
const fallbackRuleTriage = (text) => {
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
    return {
      isEmergency: true,
      specializationNeeded: 'Emergency Medicine',
      guidance: '🚨 **EMERGENCY WARNING**: Your described symptoms sound critical. Please do not wait. Call emergency services immediately (Dial 108) or visit the nearest emergency room (e.g., SMS Hospital Trauma Center, JLN Marg, Jaipur).',
      recommendation: 'Call emergency services (108) or go to nearest ER immediately.'
    };
  }

  let detectedSpec = 'General Physician';
  let guidance = '';

  if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('itching') || text.includes('eczema') || text.includes('pimples')) {
    detectedSpec = 'Dermatologist';
    guidance = 'Based on your skin-related symptoms (rash/itching/irritation), avoid scratching the area and apply a cool moist compress. Avoid applying harsh chemical soaps.';
  } else if (text.includes('child') || text.includes('baby') || text.includes('kid') || text.includes('toddler') || text.includes('infant')) {
    detectedSpec = 'Pediatrician';
    guidance = 'For pediatric concerns, keep the child well-hydrated, monitor temperature carefully, and avoid over-the-counter adult medications.';
  } else if (text.includes('joint') || text.includes('bone') || text.includes('fracture') || text.includes('knee') || text.includes('back pain') || text.includes('spine')) {
    detectedSpec = 'Orthopedic';
    guidance = 'For joint or bone pain, practice gentle rest, ice packing (R.I.C.E protocol), and avoid heavy lifting until a specialist evaluates your condition.';
  } else if (text.includes('physio') || text.includes('muscle stiffness') || text.includes('posture') || text.includes('sprain') || text.includes('rehab')) {
    detectedSpec = 'Physiotherapist';
    guidance = 'For muscle sprains or stiffness, gentle warm compresses and non-strenuous movement can ease tension.';
  } else if (text.includes('heart') || text.includes('palpitations') || text.includes('bp') || text.includes('blood pressure') || text.includes('cholesterol')) {
    detectedSpec = 'Cardiologist';
    guidance = 'For cardiovascular symptoms or blood pressure fluctuations, avoid high sodium food, reduce stress, and ensure a prompt specialist review.';
  } else if (text.includes('headache') || text.includes('migraine') || text.includes('dizziness') || text.includes('numbness') || text.includes('nerve')) {
    detectedSpec = 'Neurologist';
    guidance = 'For recurrent headaches or nerve sensations, stay hydrated in Jaipur heat, rest in a dark quiet room, and track pain frequency.';
  } else if (text.includes('ear') || text.includes('nose') || text.includes('throat') || text.includes('sinus') || text.includes('tonsils')) {
    detectedSpec = 'ENT Specialist';
    guidance = 'For ear, nose, or throat irritation, warm saline gargles and steam inhalation can offer temporary relief.';
  } else {
    detectedSpec = 'General Physician';
    guidance = 'For general malaise, mild fever, or flu symptoms, ensure plenty of oral fluids, rest, and monitor your vitals.';
  }

  return {
    isEmergency: false,
    specializationNeeded: detectedSpec,
    guidance,
    recommendation: ''
  };
};

export const handleSymptomTriage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Symptom message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let triageResult = null;
    let usedGemini = false;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        
        // Try gemini models in order of preference
        const modelNames = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        let geminiResponse = null;

        const prompt = `You are an AI Medical Triage Assistant for Jaipur MediConnect healthcare platform.
Analyze the patient's symptoms described below and summarize guidance.

AVAILABLE DOCTOR SPECIALIZATIONS IN JAIPUR NETWORK:
- "General Physician"
- "Dermatologist"
- "Pediatrician"
- "Physiotherapist"
- "Cardiologist"
- "Orthopedic"
- "Neurologist"
- "ENT Specialist"

CRITICAL INSTRUCTIONS:
1. Determine if symptoms represent a critical medical emergency (chest pain, stroke, severe head trauma, acute breathlessness, massive bleeding).
2. Choose the SINGLE best matching specialization from the list above. Default to "General Physician" if non-specific.
3. Provide helpful, empathetic medical guidance and initial care advice.
4. Output MUST be ONLY a JSON object formatted as follows, without markdown or extra codeblocks:
{
  "isEmergency": boolean,
  "specializationNeeded": string,
  "guidance": string,
  "recommendation": string
}

Patient Symptoms: "${message}"`;

        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) {
              geminiResponse = text;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} failed:`, modelErr.message);
          }
        }

        if (geminiResponse) {
          let cleanJson = geminiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          
          triageResult = {
            isEmergency: !!parsed.isEmergency,
            specializationNeeded: parsed.specializationNeeded || 'General Physician',
            guidance: parsed.guidance || 'Please consult a doctor for evaluation.',
            recommendation: parsed.recommendation || ''
          };
          usedGemini = true;
        }
      } catch (geminiError) {
        console.error('Gemini API execution error, falling back to rule engine:', geminiError.message);
      }
    }

    // If Gemini was not configured or failed, use fallback rule triage
    if (!triageResult) {
      triageResult = fallbackRuleTriage(message.toLowerCase());
    }

    // Determine emergency payload
    if (triageResult.isEmergency) {
      return res.json({
        isEmergency: true,
        recommendation: triageResult.recommendation ||
          '🚨 **EMERGENCY WARNING**: Your described symptoms sound critical. Please do not wait. Call emergency services immediately (Dial 108) or visit the nearest emergency room (e.g., SMS Hospital Trauma Center, JLN Marg, Jaipur).',
        specializationNeeded: triageResult.specializationNeeded || 'Emergency Medicine',
        doctors: [],
        source: usedGemini ? 'Gemini AI' : 'Rule Engine'
      });
    }

    // Query matching Jaipur doctors from DB
    const specNeeded = triageResult.specializationNeeded || 'General Physician';
    const doctors = await Doctor.find({ specialization: specNeeded })
      .populate('hospital', 'name locality city')
      .limit(3);

    let finalDoctors = doctors;
    if (doctors.length < 3) {
      const additional = await Doctor.find({ specialization: { $ne: specNeeded } })
        .populate('hospital', 'name locality city')
        .limit(3 - doctors.length);
      finalDoctors = [...doctors, ...additional];
    }

    return res.json({
      isEmergency: false,
      specializationNeeded: specNeeded,
      guidance: triageResult.guidance,
      disclaimer: `⚠️ Note: This AI Triage Assistant (${usedGemini ? 'Powered by Gemini AI' : 'Rule Engine'}) provides informational guidance only and is not a substitute for professional medical diagnosis.`,
      doctors: finalDoctors,
      source: usedGemini ? 'Gemini AI' : 'Rule Engine'
    });

  } catch (error) {
    console.error('Triage handler error:', error);
    res.status(500).json({ message: error.message });
  }
};
