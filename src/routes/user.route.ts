import UserController from '@/controllers/user.controller';
import verificationEmailWithForm from '@/middlewares/verifyEmailForm.middleware';
import { Router } from 'express';

const router: Router = Router();
router.post('/checkGmail', UserController.checkGmail);
router.post('/accountPending', UserController.createRequestAuthenticationEmail);
router.post(
    '/signupForm',
    verificationEmailWithForm,
    UserController.signupForm,
);

export default router;
