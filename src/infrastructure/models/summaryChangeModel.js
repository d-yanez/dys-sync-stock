import mongoose from 'mongoose';

const summaryChangeSchema = new mongoose.Schema({
  date: {
    type: Number,
    required: true
  },
  previous: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    required: true
  },
  percentualChange: {
    type: Number,
    required: true
  }
}, {
  collection: 'summaryChangeStock',
  timestamps: false
});

export const SummaryChangeModel = mongoose.model('SummaryChangeStock', summaryChangeSchema);
