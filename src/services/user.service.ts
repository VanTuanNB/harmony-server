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
            const sended = await transporter.sendMail({
                from: process.env.GMAIL_SERVER,
                to: created.email,
                subject: 'Harmony music needs you to verification your email',
                html: `<p>Your verification code is: <b>${created.verificationCode}</b></p>`,
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
}
