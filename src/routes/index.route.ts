import { Router } from 'express';

import authRouter from './auth.route';
import useRouter from './user.route';
import songRouter from './song.route';

const rootRouter = Router();

rootRouter.use('/song', songRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/user', useRouter);
rootRouter.use('/', (req, res) => res.end());

export default rootRouter;
