import ThumbnailController from '@/controllers/thumbnail.controller';
import S3Service from '@/services/s3.service';
import ThumbnailService from '@/services/thumbnail.service';
import { Router } from 'express';

const router: Router = Router();
const thumbnailControllerInstance: ThumbnailController =
    new ThumbnailController(new ThumbnailService(new S3Service()));
router // default get thumbnail song
    .route('/:id')
    .get(thumbnailControllerInstance.getById.bind(thumbnailControllerInstance));

export default router;
