import { NextFunction, Request, Response } from 'express';

import IAccountPendingVerify from '@/constraints/interfaces/IAccountPendingVerify';
import { IsRequirementReq } from '@/decorators/index.decorator';
import UserService from '@/services/user.service';

export default class UserController {
    @IsRequirementReq('email', 'body')
    public static async checkGmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        const { email }: { email: string } = req.body;
        const checkEmailService = await UserService.checkEmail(email);
        return res.status(checkEmailService.status).json(checkEmailService);
    }

    @IsRequirementReq(['email', 'password', 'username'], 'body')
    public static async createRequestAuthenticationEmail(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<
            IAccountPendingVerify,
            'email' | 'password' | 'username'
        > = req.body;
        const createAndSendMailService =
            await UserService.handleCreateAndSendMail(payload);
        return res
            .status(createAndSendMailService.status)
            .json(createAndSendMailService);
    }

    public static async signupForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<
            IAccountPendingVerify,
            'email' | 'verificationCode'
        > = req.body;
        const signUpFormService = await UserService.signupForm(payload);
        return res.status(signUpFormService.status).json(signUpFormService);
    }
}
