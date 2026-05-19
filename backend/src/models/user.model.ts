import { Schema, model } from 'mongoose';
import { IUser } from '../types';

// Let's define the User Schema directly.
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Sales User'],
    default: 'Sales User',
  }
}, {
  timestamps: true
});

export const User = model<IUser>('User', userSchema);
