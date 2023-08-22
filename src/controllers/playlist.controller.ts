import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/IsRequirementRequest.decorator';
import { playlistService } from '@/instances/service.instance';
import { Request, Response } from 'express';

export default class PlaylistController {
    constructor() {}

    public async getListByUserId(
        req: Request,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const playlistUserService = await playlistService.getListByUserId(
            userId ?? '',
        );
        return res.status(playlistUserService.status).json(playlistUserService);
    }

    public async getById(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const playlistId: string = req.params.id;
        const playlistUserService = await playlistService.getById(playlistId);
        return res.status(playlistUserService.status).json(playlistUserService);
    }

    @IsRequirementReq('title', 'body')
    public async create(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id ?? '';
        const payload = req.body;
        Object.assign(payload, { userId });
        const createPlaylistService = await playlistService.create(payload);
        return res
            .status(createPlaylistService.status)
            .json(createPlaylistService);
    }

    @IsRequirementTypeId('id', 'params')
    public async update(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const playlistId = req.params.id;
        const payload = req.body;
        const updateService = await playlistService.update(playlistId, payload);
        return res.status(updateService.status).json(updateService);
    }

    @IsRequirementTypeId('id', 'params')
    public async forceDelete(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const playlistId = req.params.id;
        const forceDeleteService = await playlistService.forceDelete(
            playlistId,
        );
        return res.status(forceDeleteService.status).json(forceDeleteService);
    }
}
