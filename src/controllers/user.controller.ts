import { NextFunction, Request, Response } from 'express';

import {
    CustomRequest,
    CustomResponseExpress,
    IAccountPendingVerify,
} from '@/constraints/interfaces/index.interface';
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

    @IsRequirementReq('id', 'params')
    public static async getByNickName(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const nickname = req.params.id;
        const user = await UserService.getByNickName(nickname);
        return res.status(user.status).json(user);
    }

    @IsRequirementReq('id', 'params')
    public static async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const id = req.params.id;
        const user = await UserService.getById(id);
        return res.status(user.status).json(user);
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

    @IsRequirementReq(['email', 'verificationCode'], 'body')
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

    public static async permissionComposer(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const pendingUpgradeComposerService =
            await UserService.pendingUpgradeComposer(userId ?? '');
        return res
            .status(pendingUpgradeComposerService.status)
            .json(pendingUpgradeComposerService);
    }

    @IsRequirementReq('userId', 'body')
    public static async AskForPermissionUpgradeComposer(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId: string = req.body.userId;
        const upgradeComposerService = await UserService.upgradeComposer(
            userId,
        );
        return res
            .status(upgradeComposerService.status)
            .json(upgradeComposerService);
    }
}
