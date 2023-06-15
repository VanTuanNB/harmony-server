import { Request, Response } from 'express';

import {
    IsRequirementReq,
    IsRequirementEmail,
} from '@/decorators/index.decorator';
import AuthService from '@/services/auth.service';
import IUser from '@/constraints/interfaces/IUser';
import {
    CustomRequest,
    CustomResponseExpress,
} from '@/constraints/interfaces/custom.interface';

export default class AuthController {
    @IsRequirementReq('refreshToken', 'body')
    public static async generateRefreshToken(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { refreshToken } = req.body;
        const refererTokenService = await AuthService.generateRefererToken(
            refreshToken,
        );
        return res.status(refererTokenService.status).json(refererTokenService);
    }

    @IsRequirementReq(['email', 'password'], 'body')
    @IsRequirementEmail('email')
    public static async loginForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: { email: string; password: string } = req.body;
        const loginService = await AuthService.loginForm(payload);
        return res.status(loginService.status).json(loginService);
    }

    public static async loginPassport(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const email = req.user as IUser;
        const loginServiceGGFB = await AuthService.loginGGFB(email);
        return res.status(loginServiceGGFB.status).json(loginServiceGGFB);
    }
}
