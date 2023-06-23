import { Request, Response } from 'express';

import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/index.decorator';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import AlbumService from '@/services/album.service';

export default class AlbumController {
    @IsRequirementTypeId('id', 'params')
    @IsRequirementReq(['songReference', 'typeAction'], 'body')
    public static async updateChangesSong(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        const { songReference, typeAction } = req.body;
        const changeSongAlbumService = await AlbumService.updateChangesSong(
            id,
            songReference,
            typeAction,
        );
        return res
            .status(changeSongAlbumService.status)
            .json(changeSongAlbumService);
    }

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
