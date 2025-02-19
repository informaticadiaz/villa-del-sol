// Visitor.js
import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  identification: {
    type: String,
    required: [true, 'La identificación es requerida'],
    trim: true
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: [true, 'El apartamento es requerido']
  },
  entryTime: {
    type: Date,
    required: [true, 'La hora de entrada es requerida'],
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  reason: {
    type: String,
    required: [true, 'El motivo de la visita es requerido'],
    trim: true
  },
  vehicle: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Visitor = mongoose.model('Visitor', visitorSchema);