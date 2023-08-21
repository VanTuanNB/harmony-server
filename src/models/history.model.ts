import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IHistory } from '@/constraints/interfaces/index.interface';
import historySchema from '@/database/schemas/history.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class HistoryModel {
    public async getById(_id: string): Promise<IHistory | null> {
        const history = await historySchema.findById(_id);
        return history;
    }

    public async getByIdPoPulate(_id: string): Promise<IHistory | null> {
        const history = await historySchema.findById(_id).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers',
            populate: (
                {
                    path: 'performers',
                    strictPopulate: true,
                    select: 'name nickname'
                }
            )
        });
        return history;
    }

    public async create(payload: IHistory): Promise<IHistory> {
        const create = await historySchema.create(payload);
        return create;
    }

    public async updateByAction(
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

    public async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await historySchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }

    public async removeFirstSongIntoListSong(
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

    public async forceDelete(_id: string): Promise<IHistory | null> {
        const forceDelete = await historySchema.findByIdAndDelete(_id);
        return forceDelete;
    }
}
