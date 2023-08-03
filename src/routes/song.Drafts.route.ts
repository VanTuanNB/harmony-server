import { Router } from 'express';

import SongDraftsController from '@/controllers/songDraft.controller';
import songDraft from '@/services/songDraffs.service';
const SongDraftInstance = new SongDraftsController(new songDraft());
const router: Router = Router();

router.route('/:id').get(SongDraftInstance.getSongDaftsbyUserID);

export default router;
