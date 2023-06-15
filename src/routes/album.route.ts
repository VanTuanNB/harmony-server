import AlbumController from '@/controllers/album.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(authenticationComposer, AlbumController.create);

export default router;
