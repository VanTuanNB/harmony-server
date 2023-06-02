import IUser from '@/constraints/interfaces/IUser';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import userSchema from '@/database/schemas/user.schema';
import generateToken from '@/utils/generateToken.util';
import { v4 as uuidv4 } from 'uuid';

export default class UserModel {
    public static async getByEmail(email: string): Promise<IUser | null> {
        const user = await userSchema.findOne({ email });
        return user;
    }
    public static async create(
        payload: Omit<IUser, 'createdAt' | 'updatedAt'>,
    ): Promise<IUser> {
        const created = await userSchema.create(payload);
        return created;
    }

    public static async updateById(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<IUser | null> {
        const updated = await userSchema.findByIdAndUpdate(_id, payload);
        return updated;
    }
    
    public static async createPassport(
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
