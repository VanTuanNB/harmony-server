import { NextFunction, Request, Response } from 'express';

import {
    CustomRequest,
    CustomResponseExpress,
    IAccountPendingVerify,
} from '@/constraints/interfaces/index.interface';
import { IsRequirementReq } from '@/decorators/index.decorator';
import { userService } from '@/instances/index.instance';

export default class UserController {
    constructor() { }
    public async getAll(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const user = await userService.getAll();
        return res.status(user.status).json(user);
    }
    public async getAllByComposer(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const user = await userService.getAllByComposer();
        return res.status(user.status).json(user);
    }
    public async getAllByUser(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const user = await userService.getAllByUser();
        return res.status(user.status).json(user);
    }
    @IsRequirementReq('email', 'body')
    public async checkGmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        const { email }: { email: string } = req.body;
        const checkEmailService = await userService.checkEmail(email);
        if (!checkEmailService.success)
            return res.status(checkEmailService.status).json(checkEmailService);
        next();
    }

    @IsRequirementReq('id', 'params')
    public async getByNickName(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const nickname = req.params.id;
        const user = await userService.getByNickName(nickname);
        return res.status(user.status).json(user);
    }

    @IsRequirementReq('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const id = req.params.id;
        const user = await userService.getById(id);
        return res.status(user.status).json(user);
    }

    @IsRequirementReq(['email', 'password', 'username'], 'body')
    public async createRequestAuthenticationEmail(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<
            IAccountPendingVerify,
            'email' | 'password' | 'username'
        > = req.body;
        const createAndSendMailService =
            await userService.handleCreateAndSendMail(payload);
        return res
            .status(createAndSendMailService.status)
            .json(createAndSendMailService);
    }

    @IsRequirementReq(['email', 'verificationCode'], 'body')
    public async signupForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<
            IAccountPendingVerify,
            'email' | 'verificationCode'
        > = req.body;
        const signUpFormService = await userService.signupForm(payload);
        return res.status(signUpFormService.status).json(signUpFormService);
    }

    public async permissionComposer(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId = res.locals.memberDecoded?._id;
        const pendingUpgradeComposerService =
            await userService.pendingUpgradeComposer(userId ?? '');
        return res
            .status(pendingUpgradeComposerService.status)
            .json(pendingUpgradeComposerService);
    }

    @IsRequirementReq('userId', 'body')
    public async AskForPermissionUpgradeComposer(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId: string = req.body.userId;
        const upgradeComposerService = await userService.upgradeComposer(
            userId,
        );
        return res
            .status(upgradeComposerService.status)
            .json(upgradeComposerService);
    }

    public async updateProfileUser(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const userId: string | undefined = res.locals.memberDecoded?._id;
        const { isNewUploadAvatar, name } = req.body as {
            isNewUploadAvatar?: boolean;
            name: string;
        };
        const upgradeComposerService = await userService.updateProfile({
            name,
            isNewUploadAvatar,
            userId: userId ?? '',
        });
        return res
            .status(upgradeComposerService.status)
            .json(upgradeComposerService);
    }
}
