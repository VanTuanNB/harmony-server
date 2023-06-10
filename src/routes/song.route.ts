import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';

const router: Router = Router();

router
    .route('/')
    .post(
        uploadSong,
        SongController.middlewareCreateSong,
        SongController.create,
    );

export default router;
