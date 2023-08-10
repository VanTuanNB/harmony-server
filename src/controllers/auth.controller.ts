import { Request, Response } from 'express';

import {
    IsRequirementReq,
    IsRequirementEmail,
} from '@/decorators/index.decorator';
import {
    CustomRequest,
    CustomResponseExpress,
    IUser,
} from '@/constraints/interfaces/index.interface';
import { authService } from '@/instances/index.instance';

export default class AuthController {
    constructor() {}
    @IsRequirementReq('refreshToken', 'body')
    public async generateRefreshToken(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { refreshToken } = req.body;
        const refererTokenService = await authService.generateRefererToken(
            refreshToken,
        );
        return res.status(refererTokenService.status).json(refererTokenService);
    }

    @IsRequirementReq(['email', 'password'], 'body')
    @IsRequirementEmail('email')
    public async loginForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: { email: string; password: string } = req.body;
        const loginService = await authService.loginForm(payload);
        return res.status(loginService.status).json(loginService);
    }

    public async loginPassport(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const email = req.user as IUser;
        const loginServiceGGFB = await authService.loginGGFB(email);
        return res.status(loginServiceGGFB.status).json(loginServiceGGFB);
    }
}
