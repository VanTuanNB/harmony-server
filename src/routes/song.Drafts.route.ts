import { Router } from 'express';

import SongDraftsController from '@/controllers/songDraft.controller';

const SongDraftInstance = new SongDraftsController();
const router: Router = Router();

router
    .route('/:id')
    .get(SongDraftInstance.getSongDraftByUserId.bind(SongDraftInstance));

export default router;
