import AdminController from '@/controllers/admin.controller';
import { authenticationAdmin } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();
const adminControllerInstance = new AdminController();

router
    .route('/:id')
    .get(adminControllerInstance.getById.bind(adminControllerInstance));

    router
    .route('/')
    .post(adminControllerInstance.create.bind(adminControllerInstance));

export default router;
