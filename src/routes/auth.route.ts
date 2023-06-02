import { Router } from 'express';

import AuthController from '@/controllers/auth.controller';
import passport from 'passport';
import '../configs/passportGoogle.config'
const router: Router = Router();

router.post('/loginForm', AuthController.loginForm);
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', passport.authenticate('google', { session: false }), AuthController.loginSuccessGGFB);

export default router;
