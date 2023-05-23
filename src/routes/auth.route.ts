import { Router } from 'express';

import AuthController from '@/controllers/auth.controller';

const router: Router = Router();

router.post('/loginForm', AuthController.loginForm);

export default router;
