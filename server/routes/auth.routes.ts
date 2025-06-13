import express from 'express';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

// Login routes
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

export default router;