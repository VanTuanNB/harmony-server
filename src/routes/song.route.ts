import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
const router: Router = Router();
router.route('/stream/:id').get(SongController.getStreamSong);

router
    .route('/:id')
    .get(SongController.getById)
    .put(authenticationComposer, uploadSong, SongController.update)
    .delete(authenticationComposer, SongController.delete);
router
    .route('/')
    .get(SongController.getAll)
    .post(
        authenticationComposer,
        uploadSong,
        SongController.middlewareCreateSong,
        SongController.create,
    );

export default router;
