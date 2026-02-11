import express from 'express';

import { protect } from '../middleware/auth';
import { saveActivity, getActivities } from '../controllers/index';

const router = express.Router();

router.post('/leads/:leadId/activities', protect, saveActivity);
router.get('/leads/:leadId/activities', protect, getActivities );

export default router;