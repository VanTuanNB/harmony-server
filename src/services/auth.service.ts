import bcrypt from 'bcrypt';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import UserModel from '@/models/user.model';
import generateToken from '@/utils/generateToken.util';
import IUser from '@/constraints/interfaces/IUser';

export default class AuthService {
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
    public static async loginGGFB(
        payload: Pick<IUser, 'email'>
    ) {
        try {
            const user = await UserModel.getByEmail(payload.email)
            if (!user) return {
                status: 403,
                success: false,
                message: 'ACCOUNT_NOT_EXIST',
            }

            if (user.isRegistrationForm) return {
                status: 401,
                success: false,
                message: 'ACCOUNT_ALREADY_EXISTS',
            };

            const { accessToken, refreshToken } = generateToken({
                _id: user._id,
                email: user.email,
            });

            const updated = await UserModel.updateById(user._id, {
                refreshToken,
            });

            if (!updated) return {
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
        } catch (errors) {
            return {
                status: 500,
                success: false,
                message: 'Faill at auth server'
            }
        }
    }
}
