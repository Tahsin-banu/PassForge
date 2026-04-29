// =============================================
//  PassForge – routes/passwordRoutes.js
//  REST API Routes for Password Operations
// =============================================

const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const Password = require('../models/password');
// ---------- Character Sets ----------
const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// ---------- Strength Calculator ----------
function calcStrength(pwd) {
  const len = pwd.length;
  let score = 0;

  if (len >= 8)  score++;
  if (len >= 12) score++;
  if (len >= 20) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return levels[Math.min(Math.floor(score / 1.2), 4)];
}

// ---------- Secure Password Generator ----------
function generatePassword(length, options) {
  let charset = '';
  if (options.uppercase) charset += CHARSET.uppercase;
  if (options.lowercase) charset += CHARSET.lowercase;
  if (options.numbers)   charset += CHARSET.numbers;
  if (options.symbols)   charset += CHARSET.symbols;

  if (!charset) throw new Error('At least one character type must be selected');

  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}

// =============================================
//  POST /api/password/generate
//  Generate a new password + save to DB
// =============================================
router.post('/generate', async (req, res) => {
  try {
    const {
      length   = 16,
      options  = { uppercase: true, lowercase: true, numbers: true, symbols: false },
      password: clientPassword, // optional: sent from frontend
      strength: clientStrength  // optional: sent from frontend
    } = req.body;

    // --- Input Validation ---
    const parsedLength = parseInt(length, 10);
    if (isNaN(parsedLength) || parsedLength < 6 || parsedLength > 64) {
      return res.status(400).json({ error: 'Length must be between 6 and 64' });
    }

    const hasAnyOption =
      options.uppercase || options.lowercase || options.numbers || options.symbols;
    if (!hasAnyOption) {
      return res.status(400).json({ error: 'Select at least one character type' });
    }

    // Use server-generated password (more secure) or accept frontend value
    const finalPassword = generatePassword(parsedLength, options);
    const strength      = calcStrength(finalPassword);

    // --- Save to MongoDB ---
    const record = await Password.create({
      password: finalPassword,
      length:   parsedLength,
      options,
      strength
    });

    return res.status(201).json({
      success:  true,
      password: finalPassword,
      strength,
      id:       record._id,
      message:  'Password generated and saved!'
    });

  } catch (err) {
    console.error('Generate error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to generate password' });
  }
});

// =============================================
//  GET /api/password/history
//  Retrieve last 20 generated passwords
// =============================================
router.get('/history', async (req, res) => {
  try {
    const records = await Password
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v'); // Exclude version field

    return res.status(200).json({
      success: true,
      count:   records.length,
      data:    records
    });
  } catch (err) {
    console.error('History error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// =============================================
//  DELETE /api/password/:id
//  Delete a specific password record
// =============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Password.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }

    return res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;