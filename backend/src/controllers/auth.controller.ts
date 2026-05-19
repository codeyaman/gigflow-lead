import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { registerSchema, loginSchema } from '../utils/validation';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    if (validatedData.role === 'Admin') {
      res.status(400).json({ message: 'Registration with Admin role is not allowed' });
      return;
    }

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const user = new User({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-leads-dashboard';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.password) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-for-leads-dashboard';
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};
