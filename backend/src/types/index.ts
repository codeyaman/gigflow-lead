import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for safety when passing around
  role: 'Admin' | 'Sales User';
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

// Request extension to hold the verified user context
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'Admin' | 'Sales User';
  };
}
