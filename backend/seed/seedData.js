import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { prisma, connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting PostgreSQL Database Seeding for Jaipur Healthcare Network...');

    // Clear existing data in reverse order of foreign keys
    await prisma.appointment.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.hospital.deleteMany({});
    await prisma.user.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Test Patient & Doctor User Accounts
    const patientUser = await prisma.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'patient@jaipurmed.com',
        password: hashedPassword,
        phone: '+91 98290 12345',
        role: 'patient',
        medicalHistory: [
          { condition: 'Mild Asthma', diagnosedDate: '2023-04-12', notes: 'Uses inhaler as needed' },
          { condition: 'Dust Allergy', diagnosedDate: '2021-08-20', notes: 'Seasonal flare ups' }
        ]
      }
    });

    const doctorUser = await prisma.user.create({
      data: {
        name: 'Dr. Vikramaditya Rathore',
        email: 'doctor@jaipurmed.com',
        password: hashedPassword,
        phone: '+91 98290 99999',
        role: 'doctor'
      }
    });

    // 1. Seed Hospitals in Jaipur
    const hospitalsData = [
      {
        name: 'Sawai Man Singh (SMS) Hospital',
        address: 'JLN Marg, Ashok Nagar',
        locality: 'JLN Marg',
        city: 'Jaipur',
        contactPhone: '+91 141 2560291',
        emergencyPhone: '108',
        departments: ['General Medicine', 'Trauma Center', 'Cardiology', 'Orthopedics', 'Pediatrics'],
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        googleMapQuery: 'SMS+Hospital+Jaipur'
      },
      {
        name: 'Fortis Escorts Hospital Jaipur',
        address: 'Jawaharlal Nehru Marg, Malviya Nagar',
        locality: 'Malviya Nagar',
        city: 'Jaipur',
        contactPhone: '+91 141 2547000',
        emergencyPhone: '+91 141 2547001',
        departments: ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Physiotherapy'],
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        googleMapQuery: 'Fortis+Hospital+Jaipur'
      },
      {
        name: 'Eternal Hospital (EHCC)',
        address: '3 A, Jagatpura Road, Near Jawahar Circle',
        locality: 'Malviya Nagar / Jagatpura',
        city: 'Jaipur',
        contactPhone: '+91 141 5174000',
        emergencyPhone: '+91 141 5174001',
        departments: ['Cardiology', 'General Medicine', 'Dermatology', 'ENT', 'Pediatrics'],
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        googleMapQuery: 'Eternal+Hospital+Jaipur'
      },
      {
        name: 'Narayana Multispeciality Hospital',
        address: 'Sector 28, Kumbha Marg, Pratap Nagar',
        locality: 'Pratap Nagar / Sanganer',
        city: 'Jaipur',
        contactPhone: '+91 141 7122222',
        emergencyPhone: '108',
        departments: ['Neurology', 'Pediatrics', 'Orthopedics', 'Physiotherapy', 'ENT'],
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        googleMapQuery: 'Narayana+Hospital+Jaipur'
      },
      {
        name: 'Santokba Durlabhji Memorial Hospital (SDMH)',
        address: 'Bhawani Singh Road, Near Rambagh Circle',
        locality: 'C-Scheme',
        city: 'Jaipur',
        contactPhone: '+91 141 2566251',
        emergencyPhone: '+91 141 2566252',
        departments: ['General Medicine', 'Dermatology', 'Orthopedics', 'Pediatrics', 'ENT'],
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        googleMapQuery: 'SDMH+Hospital+Jaipur'
      }
    ];

    const seededHospitals = [];
    for (const hospData of hospitalsData) {
      const hosp = await prisma.hospital.create({ data: hospData });
      seededHospitals.push(hosp);
    }
    console.log(`✅ Seeded ${seededHospitals.length} Jaipur Hospitals.`);

    const smsHosp = seededHospitals[0];
    const fortisHosp = seededHospitals[1];
    const ehccHosp = seededHospitals[2];
    const narayanaHosp = seededHospitals[3];
    const sdmhHosp = seededHospitals[4];

    const standardSlots = [
      { day: 'Monday', times: ['09:00 AM - 09:30 AM', '10:00 AM - 10:30 AM', '02:00 PM - 02:30 PM', '04:00 PM - 04:30 PM'] },
      { day: 'Tuesday', times: ['09:30 AM - 10:00 AM', '11:00 AM - 11:30 AM', '03:00 PM - 03:30 PM', '05:00 PM - 05:30 PM'] },
      { day: 'Wednesday', times: ['10:00 AM - 10:30 AM', '12:00 PM - 12:30 PM', '02:30 PM - 03:00 PM', '06:00 PM - 06:30 PM'] },
      { day: 'Thursday', times: ['09:00 AM - 09:30 AM', '11:30 AM - 12:00 PM', '03:30 PM - 04:00 PM', '05:30 PM - 06:00 PM'] },
      { day: 'Friday', times: ['10:30 AM - 11:00 AM', '01:00 PM - 01:30 PM', '04:00 PM - 04:30 PM', '06:30 PM - 07:00 PM'] }
    ];

    const doctorsData = [
      {
        name: 'Dr. Vikramaditya Rathore',
        specialization: 'General Physician',
        hospitalId: smsHosp.id,
        consultationFee: 500,
        consultationTypes: ['Both'],
        rating: 4.9,
        experienceYears: 16,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
        bio: 'Senior Physician at SMS Hospital specializing in internal medicine, fever management, and lifestyle disorders.',
        qualification: 'MBBS, MD (Internal Medicine) - SMS Medical College',
        email: 'doctor@jaipurmed.com',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Ananya Sen',
        specialization: 'General Physician',
        hospitalId: ehccHosp.id,
        consultationFee: 700,
        consultationTypes: ['Online', 'Both'],
        rating: 4.8,
        experienceYears: 12,
        imageUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&w=500&q=80',
        bio: 'Expert in preventive health checkups, hypertension, diabetes management, and acute viral illnesses.',
        qualification: 'MBBS, DNB (Family Medicine)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Priyanshu Shekhawat',
        specialization: 'Dermatologist',
        hospitalId: fortisHosp.id,
        consultationFee: 800,
        consultationTypes: ['Both'],
        rating: 4.9,
        experienceYears: 14,
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
        bio: 'Renowned Jaipur Dermatologist treating skin allergies, eczema, acne vulgaris, psoriasis, and cosmetic care.',
        qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Meera Agarwal',
        specialization: 'Dermatologist',
        hospitalId: sdmhHosp.id,
        consultationFee: 650,
        consultationTypes: ['Online', 'Both'],
        rating: 4.7,
        experienceYears: 10,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
        bio: 'Specialist in pediatric skin disorders, allergic dermatitis, and laser skin treatments.',
        qualification: 'MBBS, DVD, Fellow in Aesthetic Medicine',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Rajeshwar Singh',
        specialization: 'Pediatrician',
        hospitalId: sdmhHosp.id,
        consultationFee: 600,
        consultationTypes: ['Both'],
        rating: 4.9,
        experienceYears: 18,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80',
        bio: 'Compassionate child specialist with extensive expertise in child growth, vaccination schedules, and pediatric infections.',
        qualification: 'MBBS, MD (Pediatrics) - Sawai Man Singh College',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Neha Khandelwal',
        specialization: 'Pediatrician',
        hospitalId: narayanaHosp.id,
        consultationFee: 550,
        consultationTypes: ['Both'],
        rating: 4.8,
        experienceYears: 9,
        imageUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78905?auto=format&fit=crop&w=500&q=80',
        bio: 'Dedicated pediatrician focusing on newborn care, child nutrition, and respiratory health.',
        qualification: 'MBBS, DCH (Pediatrics)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Karan Bansiwal',
        specialization: 'Physiotherapist',
        hospitalId: fortisHosp.id,
        consultationFee: 600,
        consultationTypes: ['Offline', 'Both'],
        rating: 4.8,
        experienceYears: 11,
        imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=500&q=80',
        bio: 'Sports rehabilitation expert offering manual therapy, post-op joint rehab, and spine ergonomics counseling.',
        qualification: 'BPT, MPT (Sports Orthopedics)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Sunil Sharma',
        specialization: 'Cardiologist',
        hospitalId: ehccHosp.id,
        consultationFee: 1200,
        consultationTypes: ['Both'],
        rating: 5.0,
        experienceYears: 22,
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
        bio: 'Chief Interventional Cardiologist at Eternal Hospital, expert in angioplasty, heart failure, and preventative cardiology.',
        qualification: 'MBBS, MD, DM (Cardiology)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Ashok Vyas',
        specialization: 'Orthopedic',
        hospitalId: smsHosp.id,
        consultationFee: 600,
        consultationTypes: ['Both'],
        rating: 4.8,
        experienceYears: 15,
        imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
        bio: 'Specialist in joint replacement surgery, arthritis management, and fracture care.',
        qualification: 'MBBS, MS (Orthopedics)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Shalini Gupta',
        specialization: 'Neurologist',
        hospitalId: narayanaHosp.id,
        consultationFee: 1000,
        consultationTypes: ['Both'],
        rating: 4.9,
        experienceYears: 14,
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
        bio: 'Senior Neurologist managing migraine disorders, epilepsy, nerve pain, and stroke rehabilitation.',
        qualification: 'MBBS, MD, DM (Neurology)',
        availabilitySlots: standardSlots
      },
      {
        name: 'Dr. Devendra Joshi',
        specialization: 'ENT Specialist',
        hospitalId: sdmhHosp.id,
        consultationFee: 550,
        consultationTypes: ['Both'],
        rating: 4.7,
        experienceYears: 13,
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80',
        bio: 'Expert in sinus disorders, allergy treatments, ear infections, and hearing evaluation.',
        qualification: 'MBBS, MS (ENT)',
        availabilitySlots: standardSlots
      }
    ];

    const seededDoctors = [];
    for (const doc of doctorsData) {
      const createdDoc = await prisma.doctor.create({ data: doc });
      seededDoctors.push(createdDoc);
    }

    console.log(`✅ Seeded ${seededDoctors.length} Jaipur Doctors across hospitals.`);

    // 3. Seed an initial sample appointment
    const sampleAppointment = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: seededDoctors[0].id,
        hospitalId: smsHosp.id,
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        timeslot: '10:00 AM - 10:30 AM',
        status: 'Confirmed',
        type: 'Online',
        feePaid: true,
        feeAmount: seededDoctors[0].consultationFee,
        transactionId: 'TXN_JAIPUR_INIT_984',
        symptomsNotes: 'Mild seasonal fever and dry cough for 2 days.',
        chatHistory: []
      }
    });

    console.log(`✅ Seeded sample appointment (ID: ${sampleAppointment.id})`);
    console.log('🎉 Jaipur Healthcare PostgreSQL Database Seeded Successfully!');
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  }
};

if (process.argv[1] && process.argv[1].includes('seedData.js')) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}
