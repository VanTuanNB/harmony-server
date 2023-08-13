import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/IsRequirementRequest.decorator';
import { songDraftService } from '@/instances/service.instance';

import { Response } from 'express';

export default class SongDraftsController {
    constructor() {}

    @IsRequirementReq('id', 'params')
    public async getSongDraftByUserId(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        const getSongDraft = await songDraftService.getListSongDraftById(id);
        return res.status(getSongDraft.status).json(getSongDraft);
    }
}
