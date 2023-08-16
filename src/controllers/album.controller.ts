import { Request, Response } from 'express';

import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/index.decorator';
import { albumService } from '@/instances/index.instance';

export default class AlbumController {
    constructor() { }

    @IsRequirementReq('item', 'query')
    public async getAlbumNewWeek(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const item = req.query.item as string
        const albums = await albumService.getAlbumNewWeek(parseInt(item));
        return res.status(albums.status).json(albums);
    }
    @IsRequirementTypeId('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const album = await albumService.getByIdPopulate(_id);
        return res.status(album.status).json(album);
    }

    

    @IsRequirementReq(['title', 'publish'], 'body')
    public async create(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const payload: Pick<
            IAlbum,
            'title' | 'publish' | 'userReference' | 'listSong' | 'information'
        > = req.body;
        Object.assign(payload, {
            userReference: res.locals.memberDecoded?._id ?? '',
        });
        const createAlbumService = await albumService.create(payload);
        return res.status(createAlbumService.status).json(createAlbumService);
    }

    @IsRequirementReq('id', 'params')
    public async update(
        req: Request,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const id: string = req.params.id;
        const userId: string = res.locals.memberDecoded?._id ?? '';
        const payload = req.body as Pick<
            IAlbum,
            'title' | 'publish' | 'information' | 'listSong'
        > & {
            isNewUploadThumbnail: boolean;
            userId: string;
            contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG;
        };
        Object.assign(payload, { userId });
        const updateService = await albumService.update(id, payload);
        return res.status(updateService.status).json(updateService);
    }
}
