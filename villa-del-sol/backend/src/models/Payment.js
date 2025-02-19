// Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: [true, 'El propietario es requerido']
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: [true, 'El apartamento es requerido']
  },
  amount: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  concept: {
    type: String,
    required: [true, 'El concepto es requerido'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'check', 'card'],
    required: [true, 'El método de pago es requerido']
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);