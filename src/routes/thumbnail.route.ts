import ThumbnailController from '@/controllers/thumbnail.controller';
import { Router } from 'express';

const router: Router = Router();
const thumbnailControllerInstance: ThumbnailController =
    new ThumbnailController();

router
    .route('/avatar/:id')
    .get(
        thumbnailControllerInstance.getUserAvatar.bind(
            thumbnailControllerInstance,
        ),
    );

router
    .route('/album/:id')
    .get(
        thumbnailControllerInstance.getAlbum.bind(thumbnailControllerInstance),
    );
router // default get thumbnail song
    .route('/:id')
    .get(thumbnailControllerInstance.getById.bind(thumbnailControllerInstance));

export default router;
