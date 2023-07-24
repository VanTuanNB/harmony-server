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

    public static async getAlbumNewWeek(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const albums = await AlbumService.getAlbumNewWeek();
        return res.status(albums.status).json(albums);
    }
    @IsRequirementTypeId('id', 'params')
    public static async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const album = await AlbumService.getById(_id);
        return res.status(album.status).json(album);
    }

    @IsRequirementReq(['item', 'id'], 'query')
    public static async getAllByComposer(
        req: CustomRequest,
        res: Response
    ): Promise<Response | void> {
        const item = req.query.item as string;
        const id = req.query.id as string
        // console.log(id);
        // console.log(item);

        const albumComposer = await AlbumService.getAllByComposer(id, parseInt(item));
        return res.status(albumComposer.status).json(albumComposer);
    }
}
