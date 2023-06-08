import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';
import { Router } from 'express';

const router: Router = Router();

router
    .route('/')
    .get(SongController.getAll)
    .post(uploadSong, SongController.create);

export default router;