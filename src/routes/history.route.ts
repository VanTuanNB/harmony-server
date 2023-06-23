import HistoryController from '@/controllers/history.controller';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(authenticationUser, HistoryController.create);

export default router;
