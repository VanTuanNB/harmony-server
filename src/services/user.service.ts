import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import transporter from '@/configs/nodemailer.config';
import { RoleConstant } from '@/constraints/enums/role.enum';
import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import {
    IAccountPendingVerify,
    IUser,
} from '@/constraints/interfaces/index.interface';
import UserFilter from '@/filters/user.filter';
import ValidatePayload from '@/helpers/validate.helper';
import {
    accountPendingVerifyModel,
    userModel,
} from '@/instances/index.instance';
import { s3Service } from '@/instances/service.instance';
import { generateToken } from '@/utils/jwtToken.util';

interface ISendMail {
    to: string;
    subject: string;
    message: string;
}
export default class UserService {
    constructor() { }
    public async getAllByComposer(): Promise<CustomResponse<IUser[] | []>> {
        try {
            const user = await userModel.getAllByComposer();
            return {
                status: 200,
                success: true,
                message: 'GET_USER_COMPOSER_SUCCESSFULLY',
                data: user,
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_USER_COMPOSER_FAILED',
                errors: error,
            };
        }
    }
    public async getAllByUser(): Promise<CustomResponse<IUser[] | []>> {
        try {
            const user = await userModel.getAllByUser();
            return {
                status: 200,
                success: true,
                message: 'GET_USER_SUCCESSFULLY',
                data: user,
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_USER_FAILED',
                errors: error,
            };
        }
    }
    public async getAll(): Promise<CustomResponse<IUser[] | []>> {
        try {
            const user = await userModel.getAll();
            return {
                status: 200,
                success: true,
                message: 'GET_USER_ALL_SUCCESSFULLY',
                data: user,
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_USER_ALL_FAILED',
                errors: error,
            };
        }
    }
    public async getById(_id: string): Promise<CustomResponse<IUser | null>> {
        try {
            const user = await userModel.getByIdPopulate(_id);
            if (!user) return {
                status: 400,
                success: true,
                message: 'GET_USER_BY_ID_EXISTS',
            }
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
    public async getByNickName(
        nickname: string,
    ): Promise<CustomResponse<IUser | null>> {
        try {
            const user = await userModel.getByNickNamePopulate(nickname);
            if (!user) return {
                status: 400,
                success: true,
                message: 'GET_USER_BY_NICK_NAME_EXISTS',
            }
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
    public async checkEmail(email: string): Promise<CustomResponse> {
        try {
            const userInDb = await userModel.getByEmail(email);
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

    public async handleCreateAndSendMail(
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
            const created = await accountPendingVerifyModel.create(
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

    public async signupForm(
        payload: Pick<IAccountPendingVerify, 'email' | 'verificationCode'>,
    ): Promise<CustomResponse> {
        try {
            const collectionValidateUser =
                await accountPendingVerifyModel.getByEmail(payload.email);
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
                avatarS3: null,
            });
            const validation = await ValidatePayload(
                dataUser,
                'BAD_REQUEST',
                true,
            );
            if (validation) return validation;
            await userModel.create(dataUser);
            const deletedCollectionVerifyEmail =
                await accountPendingVerifyModel.deleteById(
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

    public sendMailToUser({ to, subject, message }: ISendMail) {
        transporter.sendMail({
            from: process.env.GMAIL_SERVER,
            to,
            subject,
            html: `<p>${message}</p>`,
        });
    }

    public async updateFiled(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<CustomResponse<IUser | null>> {
        try {
            const updatedUser = await userModel.updateById(_id, payload);
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

    public async pendingUpgradeComposer(
        userId: string,
    ): Promise<CustomResponse> {
        try {
            const user = await userModel.getById(userId);
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

    public async upgradeComposer(userId: string): Promise<CustomResponse> {
        try {
            const user = await userModel.getById(userId);
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

    public async updateProfile(
        payload: Pick<IUser, 'name'> & {
            userId: string;
            isNewUploadAvatar?: boolean;
            contentType?:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.PNG
            | EContentTypeObjectS3.JPG;
        },
    ): Promise<CustomResponse> {
        try {
            let nickname: string | undefined = undefined;
            if (payload.name) {
                let randomEntryPointSlug: number = 0;
                do {
                    randomEntryPointSlug = Math.floor(Math.random() * 10000);
                } while (randomEntryPointSlug < 1000);
                nickname =
                    (payload.name
                        .normalize('NFD')
                        .replace(/[^a-z0-9\s]/gi, '')
                        .toLocaleLowerCase()
                        .replace(/\s+/g, '') ?? '') +
                    (randomEntryPointSlug < 1000
                        ? randomEntryPointSlug * 10
                        : randomEntryPointSlug);
            }
            let responseData = undefined;
            if (payload.isNewUploadAvatar) {
                const response = await s3Service.getSignUrlForUploadUserAvatar(
                    payload.userId,
                    payload.contentType || EContentTypeObjectS3.JPEG,
                );
                responseData = response.data;
            }
            await userModel.updateById(payload.userId, {
                name: payload.name,
                nickname,
            });

            return {
                status: 200,
                success: true,
                message: 'UPDATE_PROFILE_SUCCESSFULLY',
                data: responseData ? responseData : {},
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_PROFILE_FAILED',
                errors: error,
            };
        }
    }
}
