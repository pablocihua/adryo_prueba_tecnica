import express from 'express';

import { protect } from '../middleware/auth';
import { login, getMe } from '../controllers/index';

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas restrigidas
router.get('/me', protect, getMe )

export default router;