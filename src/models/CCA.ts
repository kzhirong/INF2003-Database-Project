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
    type: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      startTime: String,  // "18:00" (24-hour format from <input type="time">)
      endTime: String,    // "20:00" (24-hour format from <input type="time">)
      location: String    // "Sports Hall, Level 1"
    }],
    required: false  // Only required for "Schedule Based" commitment
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
  // Dynamic content blocks - stored as flexible array
  blocks: {
    type: [mongoose.Schema.Types.Mixed] // Allows flexible structure
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

// Clear cached model to ensure schema changes are applied
if (mongoose.models.CCA) {
  delete mongoose.models.CCA;
}

// Create model with updated schema
const CCA = mongoose.model('CCA', ccaSchema);

export default CCA;
