import { Request, Response } from 'express';

import {
    IsRequirementReq,
    IsRequirementEmail,
} from '@/decorators/index.decorator';
import AuthService from '@/services/auth.service';

export default class AuthController {
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
}
