import { Router } from 'express';

import SongController from '@/controllers/song.controller';
import { uploadSong } from '@/middlewares/uploadSong.middleware';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
import SongService from '@/services/song.service';
import S3Service from '@/services/s3.service';
const router: Router = Router();
const songControllerInstance = new SongController(
    new SongService(new S3Service()),
);
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
