import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
const router: Router = Router();
const songControllerInstance = new SongController();
router
    .route('/stream/:id')
    .get(songControllerInstance.getStreamSong.bind(songControllerInstance));

router
    .route('/increase/:id')
    .post(songControllerInstance.increaseView.bind(songControllerInstance));
router
    .route('/:id')
    .get(songControllerInstance.getById.bind(songControllerInstance))
    .put(
        authenticationComposer,
        songControllerInstance.update.bind(songControllerInstance),
    )
    .delete(
        authenticationComposer,
        songControllerInstance.forceDelete.bind(songControllerInstance),
    );
router
    .route('/')
    .post(
        authenticationComposer,
        songControllerInstance.create.bind(songControllerInstance),
    );

export default router;
