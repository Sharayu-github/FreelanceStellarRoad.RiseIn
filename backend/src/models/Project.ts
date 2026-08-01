import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  id: number;
  title: string;
  description: string;
  amount: string;
  deadline: Date;
  status: 'open' | 'in_progress' | 'submitted' | 'completed' | 'refunded';
  client: string;
  freelancer?: string;
  workRef?: string;
  metaHash: string;
  skills: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'submitted', 'completed', 'refunded'],
    default: 'open'
  },
  client: { type: String, required: true },
  freelancer: { type: String },
  workRef: { type: String },
  metaHash: { type: String, required: true },
  skills: [{ type: String }],
  notes: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema);