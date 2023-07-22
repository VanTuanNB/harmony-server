import ComposerController from '@/controllers/composer.controller';
import { Router } from 'express';

const router: Router = Router();

router.route('/').post(ComposerController.create); // middleware admin role

router.route('/:id').get(ComposerController.getById);

export default router;
