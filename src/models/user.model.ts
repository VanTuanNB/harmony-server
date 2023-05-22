import { v4 as uuidv4 } from 'uuid';

import IUser from '@/constraints/interfaces/IUser';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import userSchema from '@/database/schemas/user.schema';
import generateToken from '@/utils/generateToken.util';

export default class UserModel {
    public static async getByEmail(
        email: string,
    ): Promise<CustomResponse<IUser | null>> {
        try {
            const user = await userSchema.findOne({ email });
            return {
                status: 200,
                success: true,
                message: 'GET_USER_SUCCESSFULLY',
                data: user,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_USER_EMAIL_FAILED',
                errors: error,
            };
        }
    }
    public static async create(
        payload: Omit<IUser, '_id' | 'refreshToken'>,
    ): Promise<CustomResponse<{ accessToken: string; refreshToken: string }>> {
        try {
            const _id: string = uuidv4();
            const { accessToken, refreshToken } = generateToken({
                _id,
                email: payload.email,
            });
            await userSchema.create({
                _id,
                refreshToken,
                ...payload,
            });
            return {
                status: 201,
                success: true,
                message: 'POST_USER_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_USER_FAILED',
                errors: error,
            };
        }
    }
}
