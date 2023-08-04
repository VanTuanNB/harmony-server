import { Request, Response } from 'express';
import { IsRequirementReq } from '@/decorators/index.decorator';
import ThumbnailService from '@/services/thumbnail.service';

export default class ThumbnailController {
    constructor(private thumbnailService: ThumbnailService) {}
    @IsRequirementReq('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const slugId: string = req.params.id;
        const resizeQuery = req.query.resize as string | undefined;
        const thumbnailService = await this.thumbnailService.getThumbnailSong(
            slugId,
            resizeQuery,
        );
        if (!thumbnailService.success)
            return res.status(thumbnailService.status).json(thumbnailService);

        return res
            .status(thumbnailService.status)
            .set('Content-Type', 'image/jpeg')
            .send(thumbnailService.data);
    }
}
