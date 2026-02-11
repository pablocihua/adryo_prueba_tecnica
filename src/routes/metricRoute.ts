import express from 'express';

import { getMetrics } from '../controllers/index'
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/metrics/leads', protect, getMetrics );

export default router;