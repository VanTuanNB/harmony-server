import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
const router: Router = Router();
const songControllerInstance = new SongController();
router
    .route('/stream/:id')
    .get(songControllerInstance.getStreamSong.bind(songControllerInstance));
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
// .delete(authenticationComposer, SongController.delete);
// router
//     .route('/')
//     .get(SongController.getAll)
//     .post(
//         authenticationComposer,
//         uploadSong,
//         SongController.middlewareCreateSong,
//         SongController.create,
//     );
router
    .route('')
    .post(
        authenticationComposer,
        songControllerInstance.create.bind(songControllerInstance),
    );

export default router;
