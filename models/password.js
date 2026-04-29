// =============================================
//  PassForge – models/Password.js
//  Mongoose Schema for Password Records
// =============================================

const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema(
  {
    // The generated password (stored for history — encrypt in production)
    password: {
      type:     String,
      required: [true, 'Password value is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    // Length of the password
    length: {
      type:    Number,
      required: true,
      min:     [6,  'Minimum length is 6'],
      max:     [64, 'Maximum length is 64']
    },

    // Which character types were used
    options: {
      uppercase: { type: Boolean, default: true  },
      lowercase: { type: Boolean, default: true  },
      numbers:   { type: Boolean, default: true  },
      symbols:   { type: Boolean, default: false }
    },

    // Human-readable strength label
    strength: {
      type: String,
      enum: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'],
      required: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Password', PasswordSchema);