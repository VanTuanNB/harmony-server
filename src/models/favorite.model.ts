import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IFavorite } from '@/constraints/interfaces/index.interface';
import favoriteSchema from '@/database/schemas/favorite.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class FavoriteModel {
    public static async getById(_id: string): Promise<IFavorite | null> {
        const favorite = await favoriteSchema.findById(_id);
        return favorite;
    }

    public static async getByIdPoPulate(
        _id: string,
    ): Promise<IFavorite | null> {
        const favorite = await favoriteSchema.findById(_id).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers songPathReference',
        });
        return favorite;
    }

    public static async create(payload: IFavorite): Promise<IFavorite> {
        const create = await favoriteSchema.create(payload);
        return create;
    }

    public static async updateByAction(
        _id: string,
        songId: string,
        action: EnumActionUpdate,
    ): Promise<IFavorite | null> {
        switch (action) {
            case EnumActionUpdate.PUSH:
                const updateActionPush = await favoriteSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: { updatedAt: new Date().toUTCString() },
                        $push: { listSong: songId },
                    },
                    {
                        new: true,
                    },
                );

                return updateActionPush;
            case EnumActionUpdate.REMOVE:
                const updateActionPull = await favoriteSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: { updatedAt: new Date().toUTCString() },
                        $pull: { listSong: { $in: songId } },
                    },
                    {
                        new: true,
                    },
                );

                return updateActionPull;
            default:
                throw new Error('INVALID ACTION UPDATE HISTORY');
        }
    }

    public static async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await favoriteSchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }

    public static async forceDelete(_id: string): Promise<IFavorite | null> {
        const forceDelete = await favoriteSchema.findByIdAndDelete(_id);
        return forceDelete;
    }
}
