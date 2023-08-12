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
import { albumService } from '@/instances/index.instance';
import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';

export default class AlbumController {
    constructor() {}

    public async getAlbumNewWeek(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const albums = await albumService.getAlbumNewWeek();
        return res.status(albums.status).json(albums);
    }
    @IsRequirementTypeId('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const album = await albumService.getById(_id);
        return res.status(album.status).json(album);
    }

    @IsRequirementReq(['title', 'publish'], 'body')
    @IsRequirementTypeId(['userReference', 'listSong'], 'body')
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
