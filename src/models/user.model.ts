import { RoleConstant } from '@/constraints/enums/role.enum';
import { ISong, IUser } from '@/constraints/interfaces/index.interface';
import userSchema from '@/database/schemas/user.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class UserModel {
    public async getAllByUser(): Promise<IUser[] | []> {
        const user = await userSchema.find({ role: RoleConstant.USER })
        return user;
    }
    public async getAll(): Promise<IUser[]> {
        const user = await userSchema.find();
        return user;
    }


    public async getById(_id: string): Promise<IUser | null> {
        const user = await userSchema.findById(_id);
        return user;
    }
    public async getAllByComposer(): Promise<IUser[] | []> {
        const user = await userSchema.find({ role: RoleConstant.COMPOSER }).select('_id name role');
        return user;
    }

    public async getByIdPopulate(id: string): Promise<IUser | null> {
        const user = await userSchema.findById(id)
            .select('role albumsReference avatarUrl email name locale nickname playlistReference songsReference favoriteListReference historyReference playlistReference')
            .populate({
                path: 'songsReference',
                strictPopulate: true,
                select: '_id title publish thumbnailUrl albumReference performers genresReference ',
                populate: [
                    {
                        path: 'albumReference',
                        strictPopulate: true,
                    },
                    {
                        path: 'performers',
                        strictPopulate: true,
                        select: 'name nickname'
                    }
                    ,
                    {
                        path: 'genresReference',
                        strictPopulate: true,
                        select: 'title'
                    }

                ]
            })
            .populate({
                path: 'favoriteListReference',
                strictPopulate: true,
                populate: {
                    path: 'listSong',
                    model: 'song'
                }
            }).populate({
                path: 'historyReference',
                strictPopulate: true,
                populate: {
                    path: 'listSong',
                    model: 'song'
                }
            }).populate({
                path: 'playlistReference',
                strictPopulate: true,

            }).populate({
                path: 'albumsReference',
                strictPopulate: true,
            });
        return user;
    }

    public async getByNickNamePopulate(nickname: string): Promise<IUser | null> {
        const user = await userSchema.findOne({ nickname: nickname }).select('albumsReference nickname name songsReference avatarUrl')
            .populate({
                path: 'songsReference',
                strictPopulate: true,
                select: '_id title publish thumbnailUrl albumReference performers',
                populate: [
                    {
                        path: 'albumReference',
                        strictPopulate: true,
                    },
                    {
                        path: 'performers',
                        strictPopulate: true,
                        select: 'name nickname'
                    }
                ]
            }).populate({
                path: 'albumsReference',
                strictPopulate: true,
            });
        return user;
    }

    public async search(title: string): Promise<IUser[] | null> {
        const searchUser = userSchema.find({
            $and: [
                { role: 'composer' },
                {
                    $or: [
                        { name: { $regex: title, $options: 'i' } },
                    ]
                }
            ]
        }).select('name avatarUrl nickname')
        return searchUser;
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
