import mongoose from 'mongoose';

const SalesNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAge: {
    type: Number,
    required: true,
  },
  customerGender: {
    type: String,
    required: true,
  },
  productPurchased: {
    type: String,
    required: true,
  },
  purchaseAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  installments: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Rename id to _id before sending to frontend
SalesNoteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


const SalesNote = mongoose.model('salesNote', SalesNoteSchema);

export default SalesNote;
