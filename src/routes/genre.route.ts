import GenreController from '@/controllers/genre.controller';
import genreSchema from '@/database/schemas/genre.schema';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(GenreController.create); // middleware admin role
router.route('/listGenre').get(GenreController.getAll)
export default router;
