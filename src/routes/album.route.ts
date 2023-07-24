import AlbumController from '@/controllers/album.controller';
import { authenticationComposer } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();
router
    .route('/change/:id')
    .put(authenticationComposer, AlbumController.updateChangesSong);

router.get('/composer', AlbumController.getAllByComposer)
router.route('/').post(authenticationComposer, AlbumController.create);
router.route('/:id').get( AlbumController.getById);

router.route('/newWeek').get(AlbumController.getAlbumNewWeek)

export default router;
