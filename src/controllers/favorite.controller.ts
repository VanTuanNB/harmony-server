import {
    CustomRequest,
    CustomResponse,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import { IsRequirementTypeId } from '@/decorators/IsRequirementRequest.decorator';
import FavoriteService from '@/services/favorite.service';
import { Response } from 'express';

export default class FavoriteController extends FavoriteService {
    constructor() {
        super();
    }
    public async getInformation(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const currentUserId = res.locals.memberDecoded?._id ?? '';
        const getFavoriteInfoService = await this.information(currentUserId);
        return res
            .status(getFavoriteInfoService.status)
            .json(getFavoriteInfoService);
    }

    @IsRequirementTypeId('songId', 'body')
    public async mergingCreateUpdate(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const currentUserIdDecoded = res.locals.memberDecoded?._id ?? '';
        const { songId, typeAction } = req.body;
        const mergingCreateUpdateService = await this.combineCreateUpdate(
            currentUserIdDecoded,
            songId,
            typeAction,
        );
        return res
            .status(mergingCreateUpdateService.status)
            .json(mergingCreateUpdateService);
    }
}
