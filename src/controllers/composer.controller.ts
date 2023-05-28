import IsRequirementReq from '@/decorators/IsRequirementReq.decorator';
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
}
