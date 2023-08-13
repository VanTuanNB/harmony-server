import { Router } from 'express';

import AuthController from '@/controllers/auth.controller';
import passport from 'passport';
import '@/configs/passportGoogle.config';
import '@/configs/passportFacebook.config';

const router: Router = Router();
const authControllerInstance = new AuthController();

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
    authControllerInstance.loginPassport.bind(authControllerInstance),
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
    authControllerInstance.loginPassport.bind(authControllerInstance),
);

router.post(
    '/refreshToken',
    authControllerInstance.generateRefreshToken.bind(authControllerInstance),
);

router.post(
    '/loginForm',
    authControllerInstance.loginForm.bind(authControllerInstance),
);

router.post(
    '/admin',
    authControllerInstance.loginAdmin.bind(authControllerInstance),
);

export default router;
