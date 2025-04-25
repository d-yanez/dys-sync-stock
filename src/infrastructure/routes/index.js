import express from 'express';
import { syncController }  from '../controllers/syncController.js';
import { reviewController } from '../controllers/reviewController.js';

const router = express.Router();

// Endpoint de sincronización
router.post('/sync-stock', syncController.handle);

// Endpoint de revisión de filas ignoradas
router.post('/review-errors', express.json(), reviewController.handle);

export default router;
