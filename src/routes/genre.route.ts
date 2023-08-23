import { Router } from 'express';

import GenreController from '@/controllers/genre.controller';
import { authenticationAdmin } from '@/middlewares/authVerifyToken.middleware';

const router: Router = Router();
const genreControllerInstance = new GenreController();

router.route('/topListsong').get(genreControllerInstance.getGenreTopListSong.bind(genreControllerInstance))
router.route('/top').get(genreControllerInstance.getGenreTop.bind(genreControllerInstance))
router.route('/:id')
    .get(genreControllerInstance.getById.bind(genreControllerInstance))
    .put(authenticationAdmin, genreControllerInstance.update.bind(genreControllerInstance))
router
    .route('/')
    .get(genreControllerInstance.getAll.bind(genreControllerInstance))
    .post(authenticationAdmin, genreControllerInstance.create.bind(genreControllerInstance)); // middleware admin role

export default router;
