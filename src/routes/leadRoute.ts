import express from 'express';
import {
    deleteLeadBy,
    getLead,
    getLeads,
    save,
    updateLeadBy,
} from '../controllers/index';

import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/leads', protect, save );
router.get('/leads', protect, getLeads );
router.get('/leads/:leadId', protect, getLead );
router.patch('/leads/:leadId', protect, updateLeadBy );
router.post('/leads/:leadId/stage', protect, updateLeadBy );
router.delete('/leads/:leadId', protect, deleteLeadBy );

export default router;