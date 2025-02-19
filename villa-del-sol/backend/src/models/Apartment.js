

// Apartment.js
import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'El número de apartamento es requerido'],
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'El piso es requerido']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner'
  },
  status: {
    type: String,
    enum: ['occupied', 'unoccupied'],
    default: 'unoccupied'
  },
  area: {
    type: Number,
    required: [true, 'El área es requerida']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Apartment = mongoose.model('Apartment', apartmentSchema);





