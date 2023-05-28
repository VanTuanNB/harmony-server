import { Request, Response } from 'express';

import IsRequirementReq from '@/decorators/IsRequirementReq.decorator';
import AuthService from '@/services/auth.service';

export default class AuthController {
    @IsRequirementReq(['email', 'password'], 'body')
    public static async loginForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: { email: string; password: string } = req.body;
        const loginService = await AuthService.loginForm(payload);
        return res.status(loginService.status).json(loginService);
    }
}
