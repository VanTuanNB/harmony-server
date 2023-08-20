import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { RoleConstant } from '@/constraints/enums/role.enum';
import {
    CustomResponse,
    IPayloadToken,
    IUser,
} from '@/constraints/interfaces/index.interface';
import {
    adminService,
    userModel,
    userService,
} from '@/instances/index.instance';
import { generateToken } from '@/utils/jwtToken.util';
export default class AuthService {
    constructor() { }
    public async generateRefererToken(currentRefreshToken: string): Promise<
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
            const user = await userService.getById(decodedToken._id);
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
                role: user.data?.role ?? RoleConstant.USER,
            });
            const updated = await userService.updateFiled(decodedToken._id, {
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

    public async loginForm(payload: {
        email: string;
        password: string;
    }): Promise<CustomResponse> {
        try {
            const user = await userModel.getByEmail(payload.email);
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
                role: user.role,
            });
            const updated = await userModel.updateById(user._id, {
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
                    _id: user._id,
                    avatarUrl: user.avatarUrl,
                    email: user.email,
                    name: user.name,
                    locale: user.locale,
                    role: user.role,
                    nickname: user.nickname,
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

    public async loginAdmin(payload: {
        email: string;
        password: string;
    }): Promise<CustomResponse> {
        try {
            const currentAdmin = await adminService.getByEmail(payload.email);
            if (!currentAdmin.data)
                return {
                    status: 403,
                    success: false,
                    message: 'FORBIDDEN',
                };
            const verifyPassword = await bcrypt.compare(
                payload.password,
                currentAdmin.data.password,
            );
            if (!verifyPassword)
                return {
                    status: 401,
                    success: false,
                    message: 'INCORRECT_PASSWORD',
                };
            const { accessToken, refreshToken } = generateToken({
                _id: currentAdmin.data._id,
                email: currentAdmin.data.email,
                role: currentAdmin.data.role,
            });
            const updated = await adminService.updateById(
                currentAdmin.data._id,
                {
                    refreshToken,
                },
            );
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
                    adminId: currentAdmin.data._id,
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

    public async loginGGFB(payload: Pick<IUser, 'email'>) {
        try {
            const user = await userModel.getByEmail(payload.email);
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
                role: user.role,
            });

            const updated = await userModel.updateById(user._id, {
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
                    _id: user._id,
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
