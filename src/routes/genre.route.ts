import { Router } from 'express';

import { authenticationAdmin } from '@/middlewares/authVerifyToken.middleware'
import GenreController from '@/controllers/genre.controller';

const router: Router = Router();
const genreControllerInstance = new GenreController();

router.route('/:id')
        .put(authenticationAdmin, genreControllerInstance.update.bind(genreControllerInstance))

router
    .route('/')
    .get(genreControllerInstance.getAll.bind(genreControllerInstance))
    .post(authenticationAdmin, genreControllerInstance.create.bind(genreControllerInstance)); // middleware admin role

export default router;
