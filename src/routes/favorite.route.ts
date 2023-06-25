import FavoriteController from '@/controllers/favorite.controller';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();

const favoriteInstance = new FavoriteController();

router
    .route('/')
    .get(
        authenticationUser,
        favoriteInstance.getInformation.bind(favoriteInstance),
    )
    .post(
        authenticationUser,
        favoriteInstance.mergingCreateUpdate.bind(favoriteInstance),
    );

export default router;
