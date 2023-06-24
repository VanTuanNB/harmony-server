import { Router } from 'express';

import authRouter from './auth.route';
import useRouter from './user.route';
import songRouter from './song.route';
import composerRouter from './composer.route';
import genreRouter from './genre.route';
import albumRouter from './album.route';
import thumbnailRouter from './thumbnail.route';
import historyRouter from './history.route';

const rootRouter = Router();
rootRouter.use('/thumbnail', thumbnailRouter);
rootRouter.use('/history', historyRouter);
rootRouter.use('/genre', genreRouter);
rootRouter.use('/album', albumRouter);
rootRouter.use('/composer', composerRouter);
rootRouter.use('/song', songRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/user', useRouter);
rootRouter.use('/', (req, res) => res.end());

export default rootRouter;
