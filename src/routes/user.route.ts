import { Router } from 'express';

import UserController from '@/controllers/user.controller';
import verificationEmailWithForm from '@/middlewares/verifyEmailForm.middleware';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';

const router: Router = Router();
router.post('/checkGmail', UserController.checkGmail);
router.post('/sendCode', UserController.createRequestAuthenticationEmail);
router.post(
    '/signupForm',
    verificationEmailWithForm,
    UserController.signupForm,
);
router.get(
    '/permissionComposer',
    authenticationUser,
    UserController.permissionComposer,
);
router.post(
    '/upgradeComposer',
    // authenticationUser, // authentication administrator
    UserController.AskForPermissionUpgradeComposer,
);

export default router;
