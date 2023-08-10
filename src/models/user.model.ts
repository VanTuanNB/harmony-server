import { ISong, IUser } from '@/constraints/interfaces/index.interface';
import userSchema from '@/database/schemas/user.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class UserModel {
    public async getById(_id: string): Promise<IUser | null> {
        const user = await userSchema.findById(_id);
        return user;
    }
    public async getByEmail(email: string): Promise<IUser | null> {
        const user = await userSchema.findOne({ email });
        return user;
    }
    public async create(payload: IUser): Promise<IUser> {
        const created = await userSchema.create(payload);
        return created;
    }

    public async updateById(
        _id: string,
        payload: Partial<Omit<IUser, '_id'>>,
    ): Promise<IUser | null> {
        const updated = await userSchema.findByIdAndUpdate(_id, payload, {
            new: true,
        });
        return updated;
    }

    public async updateIncreaseSongReferenceById(
        userId: string,
        songReference: string,
    ): Promise<ISong | null> {
        return await userSchema.findByIdAndUpdate(
            { _id: userId },
            {
                $push: { songsReference: songReference },
            },
            { new: true },
        );
    }

    public async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await userSchema.updateMany(
            {
                $pull: { songsReference: songReference },
            },
            { new: true },
        );
    }

    public async updateIncreaseAlbum(_id: string, albumId: string) {
        return await userSchema.findOneAndUpdate(
            { _id },
            {
                $push: { albumsReference: albumId },
            },
            { new: true },
        );
    }
}
