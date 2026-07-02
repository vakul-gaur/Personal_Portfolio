const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  email: 
  { type: String, 
    required: true, 
    trim: true, 
    lowercase: true 
  },

  phone: { 
    type: String, 
    trim: true 
  },

  subject: { 
    type: String, 
    trim: true 
  },

  message: { 
    type: String, 
    required: true 
  },

  createdAt: { 
    type: Date, 
    default: Date.now
   },

  read: { 
    type: Boolean, 
    default: false 
  },

  starred: {
    type: Boolean, 
    default: false 
  },

  adminNote: { 
    type: String, 
    default: '' 
  }

});

module.exports = mongoose.model('Contact', contactSchema);