import { Request, Response } from 'express';
import { IsRequirementReq } from '@/decorators/index.decorator';
import ThumbnailService from '@/services/thumbnail.service';

export default class ThumbnailController {
    @IsRequirementReq('id', 'params')
    public static async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const slugId: string = req.params.id;
        const resizeQuery = req.query.resize as string | undefined;
        const thumbnailService = await ThumbnailService.getThumbnail(
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
