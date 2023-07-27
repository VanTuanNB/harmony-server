import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
    CustomResponse,
    IUser,
    IPayloadToken,
} from '@/constraints/interfaces/index.interface';
import UserModel from '@/models/user.model';
import { generateToken } from '@/utils/jwtToken.util';
import UserService from './user.service';
import { RoleConstant } from '@/constraints/enums/role.enum';
export default class AuthService {
    public static async generateRefererToken(
        currentRefreshToken: string,
    ): Promise<
        CustomResponse<{
            accessToken: string;
            refreshToken: string;
        } | null>
    > {
        try {
            const decodedToken = jwt.verify(
                currentRefreshToken,
                process.env.SECRET_REFRESH_TOKEN as string,
            ) as IPayloadToken;
            const user = await UserService.getById(decodedToken._id);
            if (!user.success)
                return {
                    ...user,
                    data: null,
                };
            const compareToken =
                currentRefreshToken.localeCompare(
                    user.data?.refreshToken as string,
                ) === 0;
            if (!compareToken)
                return {
                    status: 403,
                    success: false,
                    message: 'REFRESH_TOKEN_NOT_MATCH',
                };
            const { accessToken, refreshToken } = generateToken({
                _id: decodedToken._id,
                email: decodedToken.email,
                role: user.data?.composerReference
                    ? RoleConstant.COMPOSER
                    : RoleConstant.USER,
            });
            const updated = await UserService.updateFiled(decodedToken._id, {
                refreshToken,
            });
            if (!updated.success)
                return {
                    ...updated,
                    data: null,
                };
            return {
                status: 200,
                success: false,
                message: 'GENERATE_REFRESH_TOKEN_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (error: any) {
            if (
                typeof error === 'object' &&
                error.hasOwnProperty('name') &&
                error.hasOwnProperty('message')
            )
                return {
                    status: 403,
                    success: false,
                    message: 'INVALID_REFRESH_TOKEN',
                    errors: error,
                };
            return {
                status: 500,
                success: false,
                message: 'GENERATE_REFRESH_TOKEN_FAILED',
                errors: error,
            };
        }
    }

    public static async loginForm(payload: {
        email: string;
        password: string;
    }): Promise<CustomResponse> {
        try {
            const user = await UserModel.getByEmail(payload.email);
            if (!user)
                return {
                    status: 403,
                    success: false,
                    message: 'ACCOUNT_NOT_EXIST',
                };
            if (!user.isRegistrationForm)
                return {
                    status: 401,
                    success: false,
                    message: 'ACCOUNT_ALREADY_EXISTS',
                };
            const verifyPassword = await bcrypt.compare(
                payload.password,
                user.password as string,
            );
            if (!verifyPassword)
                return {
                    status: 401,
                    success: false,
                    message: 'INCORRECT_PASSWORD',
                };
            const { accessToken, refreshToken } = generateToken({
                _id: user._id,
                email: user.email,
                role: user.composerReference
                    ? RoleConstant.COMPOSER
                    : RoleConstant.USER,
            });
            const updated = await UserModel.updateById(user._id, {
                refreshToken,
            });
            if (!updated)
                return {
                    status: 500,
                    success: false,
                    message: 'LOGIN_FAILED',
                };
            return {
                status: 200,
                success: true,
                message: 'LOGIN_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'LOGIN_FORM_FAILED',
                errors: error,
            };
        }
    }
    public static async loginGGFB(payload: Pick<IUser, 'email'>) {
        try {
            const user = await UserModel.getByEmail(payload.email);
            if (!user)
                return {
                    status: 403,
                    success: false,
                    message: 'ACCOUNT_NOT_EXIST',
                };

            if (user.isRegistrationForm)
                return {
                    status: 401,
                    success: false,
                    message: 'ACCOUNT_ALREADY_EXISTS',
                };

            const { accessToken, refreshToken } = generateToken({
                _id: user._id,
                email: user.email,
                role: user.composerReference
                    ? RoleConstant.COMPOSER
                    : RoleConstant.USER,
            });

            const updated = await UserModel.updateById(user._id, {
                refreshToken,
            });

            if (!updated)
                return {
                    status: 400,
                    success: false,
                    message: 'LOGIN_FAILED',
                };
            return {
                status: 200,
                success: true,
                message: 'LOGIN_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (errors) {
            return {
                status: 500,
                success: false,
                message: 'Faill at auth server',
            };
        }
    }
}
