import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/db.js';

// Fallback rule-based triage engine (instant & 100% reliable)
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
    guidance = 'For general malaise, fever, or flu symptoms, ensure plenty of oral fluids, rest, and monitor your vitals.';
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

    // Fast-path Gemini call with 3-second timeout race
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_actual_gemini')) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const prompt = `You are an AI Medical Triage Assistant for Jaipur MediConnect healthcare platform.
Analyze symptoms: "${message}"

OUTPUT JSON ONLY:
{
  "isEmergency": boolean,
  "specializationNeeded": "General Physician" | "Dermatologist" | "Pediatrician" | "Physiotherapist" | "Cardiologist" | "Orthopedic" | "Neurologist" | "ENT Specialist",
  "guidance": string
}`;

        // 3-second timeout controller so chatbot never hangs
        const geminiPromise = (async () => {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          return result.response.text();
        })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 3000)
        );

        const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]);

        if (geminiResponse) {
          const cleanJson = geminiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          triageResult = {
            isEmergency: !!parsed.isEmergency,
            specializationNeeded: parsed.specializationNeeded || 'General Physician',
            guidance: parsed.guidance || 'Please consult a specialist for thorough evaluation.'
          };
          usedGemini = true;
        }
      } catch (geminiErr) {
        console.warn('⚡ [TRIAGE] Gemini API skipped/timed out, using fast rule engine:', geminiErr.message);
      }
    }

    // Instant fallback rule engine if Gemini API isn't configured or timed out
    if (!triageResult) {
      triageResult = fallbackRuleTriage(message.toLowerCase());
    }

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

    const specNeeded = triageResult.specializationNeeded || 'General Physician';
    const doctors = await prisma.doctor.findMany({
      where: { specialization: specNeeded },
      include: {
        hospital: { select: { id: true, name: true, locality: true, city: true } }
      },
      take: 3
    });

    let finalDoctors = doctors;
    if (doctors.length < 3) {
      const additional = await prisma.doctor.findMany({
        where: { specialization: { not: specNeeded } },
        include: {
          hospital: { select: { id: true, name: true, locality: true, city: true } }
        },
        take: 3 - doctors.length
      });
      finalDoctors = [...doctors, ...additional];
    }

    const formattedDoctors = finalDoctors.map((d) => ({
      ...d,
      _id: d.id,
      hospital: d.hospital ? { ...d.hospital, _id: d.hospital.id } : null
    }));

    return res.json({
      isEmergency: false,
      specializationNeeded: specNeeded,
      guidance: triageResult.guidance,
      disclaimer: `⚠️ Note: This AI Triage Assistant (${usedGemini ? 'Powered by Gemini AI' : 'Rule Engine'}) provides informational guidance only.`,
      doctors: formattedDoctors,
      source: usedGemini ? 'Gemini AI' : 'Rule Engine'
    });

  } catch (error) {
    console.error('Triage handler error:', error);
    // Guarantee response with rule engine fallback even on unexpected error
    const fallback = fallbackRuleTriage((req.body?.message || '').toLowerCase());
    return res.json({
      isEmergency: fallback.isEmergency,
      specializationNeeded: fallback.specializationNeeded,
      guidance: fallback.guidance,
      doctors: [],
      source: 'Rule Engine'
    });
  }
};
