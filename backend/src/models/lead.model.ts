import { Schema, model } from 'mongoose';
import { ILead } from '../types';

const leadSchema = new Schema<ILead>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Lost'],
    default: 'New'
  },
  source: {
    type: String,
    enum: ['Website', 'Instagram', 'Referral'],
    default: 'Website'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const Lead = model<ILead>('Lead', leadSchema);
