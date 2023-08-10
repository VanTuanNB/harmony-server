import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementTypeId } from '@/decorators/IsRequirementRequest.decorator';
import { historyService } from '@/instances/service.instance';
import HistoryService from '@/services/history.service';
import { Response } from 'express';

export default class HistoryController {
    constructor() {}

    public async information(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | null> {
        const userId =
            (res.locals.memberDecoded && res.locals.memberDecoded._id) || '';
        const historyInfoService = await historyService.getInformation(userId);
        return res.status(historyInfoService.status).json(historyInfoService);
    }

    @IsRequirementTypeId('songId', 'body')
    public async mergingCreateUpdate(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id ?? '';
        const { songId } = req.body;
        const history = await historyService.bothCreateUpdate(userId, songId);
        return res.status(history.status).json(history);
    }
}
