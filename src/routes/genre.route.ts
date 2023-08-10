import GenreController from '@/controllers/genre.controller';
import { Router } from 'express';

const router: Router = Router();
const genreControllerInstance = new GenreController();

router
    .route('/')
    .get(genreControllerInstance.getAll.bind(genreControllerInstance))
    .post(genreControllerInstance.create.bind(genreControllerInstance)); // middleware admin role

export default router;
