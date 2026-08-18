const express = require('express');
const router = express.Router();
const OFFICIAL_EMAIL_DOMAIN = process.env.OFFICIAL_EMAIL_DOMAIN || 'example.com';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');
const crypto = require('crypto');
const { sendResetEmail, sendOTPEmail } = require('../utils/email');

// Validation helper
const validatePassword = (pwd) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(pwd);
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, erpId, designation, password, region } = req.body;

    // Validate 6-digit ERP
    if (!/^\d{6}$/.test(erpId)) {
      return res.status(400).json({ error: 'ERP ID must be exactly 6 digits' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { erpId } });
    if (existingUser) {
      return res.status(400).json({ error: 'ERP ID already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user. If it's the first user, make them ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        erpId,
        passwordHash,
        designation,
        region,
        role
      }
    });

    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { erpId, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { erpId } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2FA Check for Admins and Moderators
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiry }
      });

      console.log(`[DEBUG] OTP for ${user.erpId} is: ${otpCode}`);

      // Send OTP to their official email asynchronously (do not await) to prevent slow login
      const userEmail = 'projectidp75@gmail.com';
      sendOTPEmail(userEmail, otpCode).catch(err => console.error("[ERROR] Failed to send OTP:", err));

      // Return instruction to frontend
      return res.json({
        requires2FA: true,
        message: 'A 2FA code has been sent to your official email.',
        erpId: user.erpId // needed for next step
      });
    }

    // Normal User Login (No 2FA)
    const token = jwt.sign(
      { id: user.id, role: user.role, erpId: user.erpId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        erpId: user.erpId,
        role: user.role,
        designation: user.designation,
        region: user.region
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { erpId, otpCode } = req.body;

    if (!erpId || !otpCode) {
      return res.status(400).json({ error: 'ERP ID and OTP code are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        erpId,
        otpCode,
        otpExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, erpId: user.erpId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        erpId: user.erpId,
        role: user.role,
        designation: user.designation,
        region: user.region
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /api/auth/me/rewards
router.get('/me/rewards', verifyToken, async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { userId: req.user.id },
      include: {
        course: { select: { title: true } },
        module: { select: { title: true } }
      },
      orderBy: { earnedDate: 'desc' }
    });
    res.json(rewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { erpId } = req.body;
    if (!erpId) return res.status(400).json({ error: 'ERP ID is required' });

    const user = await prisma.user.findUnique({ where: { erpId } });
    if (!user) {
      // Return 200 even if user doesn't exist for security
      return res.json({ message: 'If an account exists, a reset link was generated and sent to your email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // Generate the reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    // Generate official email format based on user's name
    const userEmail = 'projectidp75@gmail.com';
    
    // Send email using nodemailer
    const emailSent = await sendResetEmail(userEmail, resetLink);
    
    if (emailSent) {
      // Returning resetLink for local dev convenience, in strict production remove `resetLink` from response
      res.json({ message: 'Reset link generated successfully and sent to your email.', resetLink });
    } else {
      // Fallback message if email fails to send (e.g. invalid SMTP config)
      res.json({ message: 'Failed to send email, but link was generated (Local Dev mode).', resetLink });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character' 
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/me
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, designation } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        ...(name && { name }), 
        ...(designation && { designation }) 
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        erpId: updatedUser.erpId,
        role: updatedUser.role,
        designation: updatedUser.designation,
        region: updatedUser.region
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
