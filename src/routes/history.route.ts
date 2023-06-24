import HistoryController from '@/controllers/history.controller';
import { authenticationUser } from '@/middlewares/authVerifyToken.middleware';
import { Router } from 'express';

const router: Router = Router();
const historyInstance = new HistoryController();
router
    .route('/')
    // .get(
    //     authenticationUser,
    //     historyInstance.getInformationByUserId.bind(historyInstance),
    // )
    .post(
        authenticationUser,
        historyInstance.mergingCreateUpdate.bind(historyInstance),
    );

export default router;
