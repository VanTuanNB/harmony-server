import { Router } from 'express';

import AuthController from '@/controllers/auth.controller';
import passport from 'passport';
import '@/configs/passportGoogle.config';
import '@/configs/passportFacebook.config';
import authenticationUser from '@/middlewares/authVerifyToken.middleware';
import { CustomResponseExpress } from '@/constraints/interfaces/custom.interface';

const router: Router = Router();
router.get(
    '/middleware',
    authenticationUser,
    (req, res: CustomResponseExpress) => {
        console.log(res.locals.userDecoded);
        return res.status(200).json({ message: 'TESTING' });
    },
);
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
