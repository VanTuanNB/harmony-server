import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IHistory } from '@/constraints/interfaces/index.interface';
import historySchema from '@/database/schemas/history.schema';

export default class HistoryModel {
    public static async getById(_id: string): Promise<IHistory | null> {
        const history = await historySchema.findById(_id);
        return history;
    }

    public static async getByIdPoPulate(_id: string): Promise<IHistory | null> {
        const history = await historySchema.findById(_id).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers songPathReference',
        });
        return history;
    }

    public static async create(payload: IHistory): Promise<IHistory> {
        const create = await historySchema.create(payload);
        return create;
    }

    public static async updateByAction(
        _id: string,
        songId: string,
        action: EnumActionUpdate,
    ): Promise<IHistory | null> {
        switch (action) {
            case EnumActionUpdate.PUSH:
                const updateActionPush = await historySchema.findByIdAndUpdate(
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
                const updateActionPull = await historySchema.findByIdAndUpdate(
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

    public static async removeFirstSongIntoListSong(
        _id: string,
    ): Promise<IHistory | null> {
        const removeFirstSong = await historySchema.findByIdAndUpdate(
            _id,
            {
                $pop: { listSong: -1 },
            },
            { new: true },
        );
        return removeFirstSong;
    }

    public static async forceDelete(_id: string): Promise<IHistory | null> {
        const forceDelete = await historySchema.findByIdAndDelete(_id);
        return forceDelete;
    }
}
