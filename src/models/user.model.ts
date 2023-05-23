import IUser from '@/constraints/interfaces/IUser';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import userSchema from '@/database/schemas/user.schema';

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
        payload: Omit<IUser, 'createdAt' | 'updatedAt'>,
    ): Promise<CustomResponse<IUser>> {
        try {
            const created = await userSchema.create(payload);
            return {
                status: 201,
                success: true,
                message: 'POST_USER_SUCCESSFULLY',
                data: created,
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

    public static async updateById(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<CustomResponse> {
        try {
            const updated = await userSchema.findByIdAndUpdate(_id, payload);
            return {
                status: 201,
                success: true,
                message: 'UPDATE_USER_SUCCESSFULLY',
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
