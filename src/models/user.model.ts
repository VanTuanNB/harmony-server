import { IUser } from '@/constraints/interfaces/index.interface';
import userSchema from '@/database/schemas/user.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class UserModel {
    public static async getById(_id: string): Promise<IUser | null> {
        const user = await userSchema.findById(_id);
        return user;
    }
    public static async getByEmail(email: string): Promise<IUser | null> {
        const user = await userSchema.findOne({ email });
        return user;
    }
    public static async create(payload: IUser): Promise<IUser> {
        const created = await userSchema.create(payload);
        return created;
    }

    public static async updateById(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<IUser | null> {
        const updated = await userSchema.findByIdAndUpdate(_id, payload, {
            new: true,
        });
        return updated;
    }

    public static async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await userSchema.updateMany(
            {
                $pull: { songsReference: songReference },
            },
            { new: true },
        );
    }
}
