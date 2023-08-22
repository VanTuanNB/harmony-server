import { Router } from 'express';

import adminRouter from './admin.route';
import albumRouter from './album.route';
import authRouter from './auth.route';
import favoriteRouter from './favorite.route';
import genreRouter from './genre.route';
import historyRouter from './history.route';
import playlistRouter from './playlist.route';
import s3Router from './s3.route';
import songRouter from './song.route';
import thumbnailRouter from './thumbnail.route';
import useRouter from './user.route';

const rootRouter = Router();
rootRouter.use('/signedUrlS3', s3Router);
rootRouter.use('/thumbnail', thumbnailRouter);
rootRouter.use('/playlist', playlistRouter);
rootRouter.use('/favorite', favoriteRouter);
rootRouter.use('/history', historyRouter);
rootRouter.use('/genre', genreRouter);
rootRouter.use('/album', albumRouter);
rootRouter.use('/song', songRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/user', useRouter);
rootRouter.use('/admin', adminRouter);
rootRouter.use('/', (req, res) => res.end());

export default rootRouter;
