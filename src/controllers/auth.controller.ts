import { Request, Response } from 'express';

import { EClientCookie } from '@/constraints/enums/common.enum';
import { ERedirect } from '@/constraints/enums/redirect.enum';
import {
    CustomRequest,
    CustomResponseExpress,
    IUser,
} from '@/constraints/interfaces/index.interface';
import {
    IsRequirementEmail,
    IsRequirementReq,
} from '@/decorators/index.decorator';
import { environment } from '@/environments/environment';
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

    @IsRequirementReq(['email', 'password'], 'body')
    @IsRequirementEmail('email')
    public async loginAdmin(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: { email: string; password: string } = req.body;
        const loginAdminService = await authService.loginAdmin(payload);
        return res.status(loginAdminService.status).json(loginAdminService);
    }

    public async loginPassport(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const email = req.user as IUser;
        const loginServiceGGFB = await authService.loginGGFB(email);
        if (!loginServiceGGFB.success)
            return res.status(loginServiceGGFB.status).redirect('');
        res.cookie(
            EClientCookie.HARMONY_USER_TOKEN,
            JSON.stringify(loginServiceGGFB.data),
            {
                domain: environment.DOMAIN_CLIENT,
                secure: environment.IS_PRODUCTION,
                sameSite: 'strict',
                maxAge: 259200000,
            },
        );
        return res
            .status(loginServiceGGFB.status)
            .redirect(
                `${environment.CLIENT_URL}${ERedirect.REDIRECT_LOGIN_SOCIAL_SUCCESS}`,
            );
    }
}
