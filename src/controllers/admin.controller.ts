import { IAdmin } from '@/constraints/interfaces/index.interface';
import {
    IsRequirementEmail,
    IsRequirementReq,
} from '@/decorators/IsRequirementRequest.decorator';
import { adminService } from '@/instances/service.instance';
import { Request, Response } from 'express';

export default class AdminController {
    constructor() {}

    @IsRequirementReq('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const getByIdService = await adminService.getById(_id);
        return res.status(getByIdService.status).json(getByIdService);
    }

    @IsRequirementReq(['email', 'password'], 'body')
    @IsRequirementEmail('email')
    public async create(req: Request, res: Response): Promise<Response | void> {
        const payload = req.body as Pick<IAdmin, 'email' | 'password' | 'name'>;
        const createAdminService = await adminService.create(payload);
        return res.status(createAdminService.status).json(createAdminService);
    }
}
