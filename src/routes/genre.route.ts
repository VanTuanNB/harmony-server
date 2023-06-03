import GenreController from '@/controllers/genre.controller';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(GenreController.create);

export default router;
