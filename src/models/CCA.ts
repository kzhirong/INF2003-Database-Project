import mongoose from 'mongoose';
import { Block } from '@/types/blocks';

// Define schema for CCA documents
const ccaSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: false,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Sports', 'Arts & Culture', 'Academic', 'Community Service', 'Special Interest']
  },
  schedule: {
    type: [String],
    required: true
  },
  commitment: {
    type: String,
    required: true,
    enum: ['Schedule Based', 'Flexible', 'Event Based']
  },
  sportType: {
    type: String,
    enum: ['Competitive', 'Recreational', 'Both']
  },
  heroImage: String,
  shortDescription: String,
  meetingDetails: {
    time: String,
    location: String,
    contactEmail: String
  },
  stats: {
    currentMembers: Number,
    maxMembers: Number
  },
  // Dynamic content blocks - stored as flexible array
  blocks: {
    type: [mongoose.Schema.Types.Mixed], // Allows flexible structure
    default: []
  },
  // Metadata
  createdBy: {
    type: String, // User ID from Supabase
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false, // We're using custom _id
  timestamps: false // We're handling timestamps manually
});

// Create or use existing model
const CCA = mongoose.models.CCA || mongoose.model('CCA', ccaSchema);

export default CCA;
