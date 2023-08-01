import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

import transporter from '@/configs/nodemailer.config';
import AccountPendingVerifyModel from '@/models/accountPendingVerify.model';
import UserModel from '@/models/user.model';
import { generateToken } from '@/utils/jwtToken.util';
import UserFilter from '@/filters/user.filter';
import ValidatePayload from '@/helpers/validate.helper';
import {
    IAccountPendingVerify,
    IUser,
} from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { RoleConstant } from '@/constraints/enums/role.enum';

interface ISendMail {
    to: string;
    subject: string;
    message: string;
}
export default class UserService {
    public static async getById(
        _id: string,
    ): Promise<CustomResponse<IUser | null>> {
        try {
            const user = await UserModel.getById(_id);
            return {
                status: 200,
                success: true,
                message: 'GET_USER_SUCCESSFULLY',
                data: user,
            };
        } catch (error) {
            return {
                status: 404,
                success: false,
                message: 'GET_USER_BY_ID_FAILED',
                errors: error,
            };
        }
    }
    public static async checkEmail(email: string): Promise<CustomResponse> {
        try {
            const userInDb = await UserModel.getByEmail(email);
            const isExitUser: boolean = !!userInDb;
            if (isExitUser)
                return {
                    status: 400,
                    success: false,
                    message: 'GMAIL_ALREADY_EXISTS',
                };
            return {
                status: 200,
                success: true,
                message: 'ACCEPTED_GMAIL',
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'CHECK_EMAIL_FAILED',
                errors: error,
            };
        }
    }

    public static async handleCreateAndSendMail(
        payload: Pick<IAccountPendingVerify, 'email' | 'password' | 'username'>,
    ): Promise<CustomResponse> {
        try {
            const _id: string = uuidv4();
            const randomCode: number = Math.floor(Math.random() * 10000);
            const verificationCode =
                randomCode < 1000 ? randomCode * 10 : randomCode;
            const hashPassword = await bcrypt.hash(payload.password, 10);
            const payloadToModel: IAccountPendingVerify = {
                ...payload,
                _id,
                verificationCode,
                password: hashPassword,
            };
            const created = await AccountPendingVerifyModel.create(
                payloadToModel,
            );
            this.sendMailToUser({
                to: created.email,
                subject: `Thư xác thực email`,
                message: `Mã xác thực của bạn: <b>${created.verificationCode}</b>`,
            });
            return {
                status: 201,
                success: true,
                message: 'POST_ACCOUNT_PENDING_SEND_MAIL_SUCCESSFULLY',
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'POST_ACCOUNT_PENDING_SEND_MAIL_FAILED',
                errors: error,
            };
        }
    }

    public static async signupForm(
        payload: Pick<IAccountPendingVerify, 'email' | 'verificationCode'>,
    ): Promise<CustomResponse> {
        try {
            const collectionValidateUser =
                await AccountPendingVerifyModel.getByEmail(payload.email);
            if (!collectionValidateUser)
                return {
                    status: 400,
                    success: false,
                    message: 'EMAIL_NOT_FOUND',
                };
            const _id: string = uuidv4();
            const { accessToken, refreshToken } = generateToken({
                _id,
                email: collectionValidateUser.email,
                role: RoleConstant.USER,
            });
            const dataUser = new UserFilter({
                _id,
                email: collectionValidateUser.email as string,
                name: collectionValidateUser.username as string,
                refreshToken,
                password: collectionValidateUser.password as string,
                isRegistrationForm: true,
                role: RoleConstant.USER,
            });
            const validation = await ValidatePayload(
                dataUser,
                'BAD_REQUEST',
                true,
            );
            if (validation) return validation;
            await UserModel.create(dataUser);
            const deletedCollectionVerifyEmail =
                await AccountPendingVerifyModel.deleteById(
                    collectionValidateUser._id,
                );
            if (!deletedCollectionVerifyEmail)
                return {
                    status: 500,
                    success: false,
                    message: 'DELETE_ACCOUNT_PENDING_FAILED',
                };
            return {
                status: 201,
                success: true,
                message: 'SIGN_UP_FORM_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'SIGN_UP_FORM_FAILED',
                errors: error,
            };
        }
    }

    public static sendMailToUser({ to, subject, message }: ISendMail) {
        transporter.sendMail({
            from: process.env.GMAIL_SERVER,
            to,
            subject,
            html: `<p>${message}</p>`,
        });
    }

    public static async updateFiled(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<CustomResponse<IUser | null>> {
        try {
            const updatedUser = await UserModel.updateById(_id, payload);
            return {
                status: 200,
                success: true,
                message: 'UPDATE_USER_SUCCESSFULLY',
                data: updatedUser,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_USER_FAILED',
                errors: error,
            };
        }
    }

    public static async pendingUpgradeComposer(
        userId: string,
    ): Promise<CustomResponse> {
        try {
            const user = await UserModel.getById(userId);
            if (!user || user.role === RoleConstant.COMPOSER)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            await this.updateFiled(userId, { isPendingUpgradeComposer: true });
            return {
                status: 200,
                success: true,
                message: 'PENDING_UPGRADE_COMPOSER_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'PENDING_UPGRADE_COMPOSER_FAILED',
            };
        }
    }

    public static async upgradeComposer(
        userId: string,
    ): Promise<CustomResponse> {
        try {
            const user = await UserModel.getById(userId);
            if (
                !user ||
                user.role === RoleConstant.COMPOSER ||
                !user.isPendingUpgradeComposer
            )
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            let randomEntryPointSlug: number = 0;
            do {
                randomEntryPointSlug = Math.floor(Math.random() * 10000);
            } while (randomEntryPointSlug < 1000);
            const nickname =
                (user.name
                    .normalize('NFD')
                    .replace(/[^a-z0-9\s]/gi, '')
                    .toLocaleLowerCase()
                    .replace(/\s+/g, '') ?? '') +
                (randomEntryPointSlug < 1000
                    ? randomEntryPointSlug * 10
                    : randomEntryPointSlug);
            await this.updateFiled(userId, {
                nickname,
                role: RoleConstant.COMPOSER,
                isPendingUpgradeComposer: false,
            });
            this.sendMailToUser({
                to: user.email,
                subject: `Thư chúc mừng`,
                message: `Cảm ơn bạn đã gắn bó với chúng tôi trong thời gian qua, chúc mừng bạn đã trở thành tác giả của Harmony Music`,
            });
            return {
                status: 200,
                success: true,
                message: 'ASK_PERMISSION_UPGRADE_COMPOSER_BY_USER_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'ASK_PERMISSION_UPGRADE_COMPOSER_BY_USER_FAILED',
            };
        }
    }
}
