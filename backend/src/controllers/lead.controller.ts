import { Response } from 'express';
import { Lead } from '../models/lead.model';
import { AuthRequest } from '../types';
import { leadSchema } from '../utils/validation';

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = leadSchema.parse(req.body);

    const lead = new Lead({
      ...validatedData,
      createdBy: req.user?.id
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Error creating lead' });
  }
};

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search, sort, page = '1' } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // Sort order: default is latest (createdAt desc)
    let sortOrder: any = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOrder = { createdAt: 1 };
    }

    const currentPage = parseInt(page as string, 10) || 1;
    const limit = 10;
    const skip = (currentPage - 1) * limit;

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    res.json({
      leads,
      pagination: {
        total: totalLeads,
        page: currentPage,
        pages: Math.ceil(totalLeads / limit),
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id).populate('createdBy', 'name email role');
    
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lead details' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = leadSchema.parse(req.body);

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    // Update fields
    lead.name = validatedData.name;
    lead.email = validatedData.email;
    lead.status = validatedData.status;
    lead.source = validatedData.source;

    await lead.save();
    res.json(lead);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: error.errors[0].message });
      return;
    }
    res.status(500).json({ message: 'Error updating lead' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    await lead.deleteOne();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lead' });
  }
};

export const exportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, source, search, sort } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    let sortOrder: any = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOrder = { createdAt: 1 };
    }

    // Fetch all matching leads without pagination limits for full export
    const leads = await Lead.find(query).sort(sortOrder);

    // Escape CSV cell helper
    const escapeCSV = (val: any) => {
      const stringVal = val === null || val === undefined ? '' : String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

    // Construct CSV content
    const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
    const rows = leads.map(lead => [
      escapeCSV(lead.name),
      escapeCSV(lead.email),
      escapeCSV(lead.status),
      escapeCSV(lead.source),
      escapeCSV(lead.createdAt.toISOString())
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};
