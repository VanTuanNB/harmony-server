import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import transporter from '@/configs/nodemailer.config';
import IAccountPendingVerify from '@/constraints/interfaces/IAccountPendingVerify';
import AccountPendingVerifyModel from '@/models/accountPendingVerify.model';
import UserModel from '@/models/user.model';
import UserValidation from '@/validations/user.validation';
import generateToken from '@/utils/generateToken.util';
import ValidatePayload from '@/helpers/validate.helper';

export default class UserController {
    public static async checkGmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        try {
            const payload: { email: string } = req.body;
            if (!payload.email)
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'PAYLOAD_GMAIL_NOT_FOUND',
                });
            const userInDb = await UserModel.getByEmail(payload.email);
            const isExitUser: boolean = !!userInDb.data;
            if (isExitUser)
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'GMAIL_ALREADY_EXISTS',
                });
            return res.status(200).json({
                status: 200,
                success: true,
                message: 'ACCEPTED_GMAIL',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }

    public static async createRequestAuthenticationEmail(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        try {
            const payload: Pick<
                IAccountPendingVerify,
                'email' | 'password' | 'username'
            > = req.body;
            if (!payload.email || !payload.password || !payload.username)
                return res.status(400).json({
                    status: 401,
                    success: false,
                    message: 'PAYLOAD_DATA_IS_EMPTY',
                });
            const created = await AccountPendingVerifyModel.create(payload);
            if (!created.success)
                return res.status(created.status).json(created);
            const sended = await transporter.sendMail({
                from: process.env.GMAIL_SERVER,
                to: created.data?.email,
                subject: 'Harmony music needs you to verification your email',
                html: `<p>Your verification code is: <b>${created.data?.verificationCode}</b></p>`,
            });
            return res.status(created.status).json(created);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }
    public static async signupForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        try {
            const collectionValidateUser =
                await AccountPendingVerifyModel.getByEmail(
                    req.body.email as string,
                );
            if (!collectionValidateUser.success)
                return res
                    .status(collectionValidateUser.status)
                    .json(collectionValidateUser);
            const _id: string = uuidv4();
            const { accessToken, refreshToken } = generateToken({
                _id,
                email: collectionValidateUser.data?.email as string,
            });
            const dataUser = new UserValidation({
                _id,
                email: collectionValidateUser.data?.email as string,
                name: collectionValidateUser.data?.username as string,
                refreshToken,
                password: collectionValidateUser.data?.password as string,
                isRegistrationForm: true,
            });
            const validation = await ValidatePayload(
                dataUser,
                'BAD_REQUEST',
                true,
            );
            if (validation) return res.status(400).json(validation);
            const createUser = await UserModel.create(dataUser);
            if (!createUser.success)
                return res.status(createUser.status).json(createUser);
            const deletedCollectionVerifyEmail =
                await AccountPendingVerifyModel.deleteById(
                    collectionValidateUser.data?._id as string,
                );
            if (!deletedCollectionVerifyEmail.success)
                return res
                    .status(deletedCollectionVerifyEmail.status)
                    .json(deletedCollectionVerifyEmail);

            return res.status(createUser.status).json({
                ...createUser,
                data: {
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }
}
