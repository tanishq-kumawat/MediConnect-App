import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jaipur_mediconnect_secret_key_2026', {
    expiresIn: '30d'
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        role: role || 'patient',
        medicalHistory: []
      }
    });

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      medicalHistory: user.medicalHistory,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        medicalHistory: user.medicalHistory,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required for OTP dispatch' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email' });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: generatedOTP,
        otpExpiresAt: expiresAt
      }
    });

    console.log(`🔑 [SECURITY 2FA OTP] Dispatched to ${email}: ${generatedOTP}`);

    res.json({
      success: true,
      message: `6-digit security OTP code dispatched to ${email}.`,
      demoOtpCode: generatedOTP
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.otpCode) {
      return res.status(400).json({ message: 'Invalid OTP request. Please request a new OTP.' });
    }

    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({ message: 'OTP code expired. Please request a new code.' });
    }

    if (user.otpCode !== otpCode.toString().trim()) {
      return res.status(400).json({ message: 'Incorrect OTP code. Please check and try again.' });
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        isPhoneVerified: true
      }
    });

    res.json({
      _id: verifiedUser.id,
      id: verifiedUser.id,
      name: verifiedUser.name,
      email: verifiedUser.email,
      role: verifiedUser.role,
      phone: verifiedUser.phone,
      medicalHistory: verifiedUser.medicalHistory,
      token: generateToken(verifiedUser.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Google email is required' });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(googleId || 'google_oauth_secret_2026', 10);
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          password: randomPassword,
          role: 'patient',
          isPhoneVerified: true,
          medicalHistory: []
        }
      });
      console.log(`🌐 [GOOGLE OAUTH] New account registered via Google: ${email}`);
    } else {
      console.log(`🌐 [GOOGLE OAUTH] User authenticated via Google: ${email}`);
    }

    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      medicalHistory: user.medicalHistory,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        medicalHistory: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (user) {
      res.json({ ...user, _id: user.id });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicalHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { condition, diagnosedDate, notes } = req.body;
    const currentHistory = Array.isArray(user.medicalHistory) ? user.medicalHistory : [];
    const updatedHistory = [...currentHistory, { condition, diagnosedDate, notes }];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { medicalHistory: updatedHistory }
    });

    res.json(updatedUser.medicalHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
