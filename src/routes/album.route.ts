import AlbumController from '@/controllers/album.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();
const albumControllerInstance = new AlbumController();

router
    .route('/newWeek')
    .get(albumControllerInstance.getAlbumNewWeek.bind(albumControllerInstance));

router
    .route('/:id')
    .get(albumControllerInstance.getById.bind(albumControllerInstance))
    .put(
        authenticationComposer,
        albumControllerInstance.update.bind(albumControllerInstance),
    );

router
    .route('/')
    .post(
        authenticationComposer,
        albumControllerInstance.create.bind(albumControllerInstance),
    );

export default router;
