import ThumbnailController from '@/controllers/thumbnail.controller';
import { Router } from 'express';

const router: Router = Router();

router.route('/:id').get(ThumbnailController.getById);

export default router;
