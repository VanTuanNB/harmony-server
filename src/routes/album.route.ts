import AlbumController from '@/controllers/album.controller';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(AlbumController.create);

export default router;
