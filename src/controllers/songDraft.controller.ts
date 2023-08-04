
import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/IsRequirementRequest.decorator';

import songDraft from '@/services/songDraffs.service';
import { Response } from 'express';

export default class SongDraftsController {
    constructor(private SongDafts: songDraft) {}

    @IsRequirementReq('id', 'params')
    public async getSongDaftsbyUserID(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        const songDraffs =await this.SongDafts.getListSongDraffsById(id)
        return res.status(songDraffs.status).json(songDraffs);
    }

   
}
