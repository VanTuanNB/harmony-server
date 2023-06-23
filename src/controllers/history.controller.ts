import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/IsRequirementRequest.decorator';
import HistoryService from '@/services/history.service';
import { Response } from 'express';

export default class HistoryController {
    @IsRequirementTypeId('listSong', 'body')
    public static async create(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id ?? '';
        const { listSong } = req.body;
        const createHistoryService = await HistoryService.create(
            userId,
            listSong,
        );
        return res
            .status(createHistoryService.status)
            .json(createHistoryService);
    }

    @IsRequirementTypeId('id', 'params')
    @IsRequirementTypeId('listSong', 'body')
    @IsRequirementReq('flagAction', 'body')
    public static async update(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id ?? '';
        const { listSong, flagAction } = req.body;
        const { id } = req.params;
        const updateHistoryService = await HistoryService.update(
            id,
            userId,
            listSong,
            flagAction,
        );
        return res
            .status(updateHistoryService.status)
            .json(updateHistoryService);
    }
}
