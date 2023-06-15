import { Router } from 'express';

import AuthController from '@/controllers/auth.controller';
import passport from 'passport';
import '@/configs/passportGoogle.config';
import '@/configs/passportFacebook.config';

const router: Router = Router();
router.post('/refreshToken', AuthController.generateRefreshToken);
router.post('/loginForm', AuthController.loginForm);

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    }),
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    AuthController.loginPassport,
);

router.get(
    '/facebook',
    passport.authenticate('facebook', {
        scope: ['public_profile', 'email'],
        session: false,
    }),
);

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    AuthController.loginPassport,
);

export default router;
