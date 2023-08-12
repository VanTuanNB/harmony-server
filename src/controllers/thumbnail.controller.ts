import { Request, Response } from 'express';
import { IsRequirementReq } from '@/decorators/index.decorator';
import { thumbnailService } from '@/instances/index.instance';

export default class ThumbnailController {
    constructor() {}
    @IsRequirementReq('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const slugId: string = req.params.id;
        const resizeQuery = req.query.resize as string | undefined;
        const getThumbnailService = await thumbnailService.getThumbnailSong(
            slugId,
            resizeQuery,
        );
        if (!getThumbnailService.success)
            return res
                .status(getThumbnailService.status)
                .json(getThumbnailService);

        return res
            .status(getThumbnailService.status)
            .set('Content-Type', 'image/jpeg')
            .send(getThumbnailService.data);
    }

    @IsRequirementReq('id', 'params')
    public async getAlbum(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const slugId: string = req.params.id;
        const resizeQuery = req.query.resize as string | undefined;
        const getThumbnailService = await thumbnailService.getThumbnailAlbum(
            slugId,
            resizeQuery,
        );
        if (!getThumbnailService.success)
            return res
                .status(getThumbnailService.status)
                .json(getThumbnailService);

        return res
            .status(getThumbnailService.status)
            .set('Content-Type', 'image/jpeg')
            .send(getThumbnailService.data);
    }

    @IsRequirementReq('id', 'params')
    public async getUserAvatar(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const slugId: string = req.params.id;
        const resizeQuery = req.query.resize as string | undefined;
        const getThumbnailService =
            await thumbnailService.getThumbnailUserAvatar(slugId, resizeQuery);
        if (!getThumbnailService.success)
            return res
                .status(getThumbnailService.status)
                .json(thumbnailService);

        return res
            .status(getThumbnailService.status)
            .set('Content-Type', 'image/jpeg')
            .send(getThumbnailService.data);
    }
}
