import { Request, Response } from 'express';

import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/index.decorator';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import AlbumService from '@/services/album.service';

export default class AlbumController {
    @IsRequirementReq(['title', 'publish', 'composerReference'], 'body')
    public static async create(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<IAlbum, 'title' | 'publish' | 'composerReference'> =
            req.body;
        const createAlbumService = await AlbumService.create(payload);
        return res.status(createAlbumService.status).json(createAlbumService);
    }
}
