import { IsRequirementReq } from '@/decorators/index.decorator';
import ComposerService from '@/services/composer.service';
import { Request, Response } from 'express';

export default class ComposerController {
    @IsRequirementReq('userId', 'body')
    public static async create(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: { userId: string } = req.body;
        const createComposerService = await ComposerService.create({
            _id: payload.userId,
        });
        return res
            .status(createComposerService.status)
            .json(createComposerService);
    }

    @IsRequirementReq('id', 'params')
    public static async getById(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { id } = req.params
        const composer = await ComposerService.getComposerPopulate(id);
        return res.status(composer.status).json(composer);
    }
}
