import PlaylistController from '@/controllers/playlist.controller';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();
const playlistController = new PlaylistController();

router
    .route('/:id')
    .get(
        authenticationUser,
        playlistController.getById.bind(playlistController),
    )
    .put(authenticationUser, playlistController.update.bind(playlistController))
    .delete(
        authenticationUser,
        playlistController.forceDelete.bind(playlistController),
    );

router
    .route('/')
    .get(
        authenticationUser,
        playlistController.getListByUserId.bind(playlistController),
    )
    .post(
        authenticationUser,
        playlistController.create.bind(playlistController),
    );

export default router;
