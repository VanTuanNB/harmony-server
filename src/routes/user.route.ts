import { Router } from 'express';

import UserController from '@/controllers/user.controller';
import verificationEmailWithForm from '@/middlewares/verifyEmailForm.middleware';

const router: Router = Router();
router.post('/checkGmail', UserController.checkGmail);
router.post('/sendCode', UserController.createRequestAuthenticationEmail);
router.post(
    '/signupForm',
    verificationEmailWithForm,
    UserController.signupForm,
);
router.put('/:id',)

export default router;
