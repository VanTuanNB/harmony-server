import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';
import { Router } from 'express';

const router: Router = Router();

router
    .route('/')
    .get(SongController.getAll)
    .post(uploadSong, SongController.create);

router
    .route('/:id')
    .get(SongController.getById)

export default router;
