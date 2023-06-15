import GenreController from '@/controllers/genre.controller';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(GenreController.create); // middleware admin role

export default router;
