import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';

const router: Router = Router();

router.route('/stream/:id').get(SongController.getStreamSong);

router.route('/:id').get(SongController.getById);
router
    .route('/')
    .get(SongController.getAll)
    .post(
        uploadSong,
        SongController.middlewareCreateSong,
        SongController.create,
    );

export default router;
