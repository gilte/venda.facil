import mongoose from 'mongoose';

const SalesNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const SalesNote = mongoose.model('salesNote', SalesNoteSchema);

export default SalesNote;