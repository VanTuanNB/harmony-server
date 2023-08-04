import { Router } from 'express';

import authRouter from './auth.route';
import useRouter from './user.route';
import songRouter from './song.route';
import genreRouter from './genre.route';
import albumRouter from './album.route';
import thumbnailRouter from './thumbnail.route';
import historyRouter from './history.route';
import favoriteRouter from './favorite.route';
import s3Router from './s3.route';

const rootRouter = Router();
rootRouter.use('/signedUrlS3', s3Router);
rootRouter.use('/thumbnail', thumbnailRouter);
rootRouter.use('/favorite', favoriteRouter);
rootRouter.use('/history', historyRouter);
rootRouter.use('/genre', genreRouter);
rootRouter.use('/album', albumRouter);
rootRouter.use('/song', songRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/user', useRouter);
rootRouter.use('/', (req, res) => res.end());

export default rootRouter;
