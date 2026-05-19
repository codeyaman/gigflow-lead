import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportCSV
} from '../controllers/lead.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all lead endpoints
router.use(authMiddleware);

router.post('/', createLead);
router.get('/', getLeads);
router.get('/export', exportCSV);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', requireRole(['Admin']), deleteLead);

export default router;
