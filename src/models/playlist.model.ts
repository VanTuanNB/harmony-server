import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IPlaylist } from '@/constraints/interfaces/ICollection.interface';
import playlistSchema from '@/database/schemas/playlist.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class PlaylistModel {
    public async getByTitle(title: string): Promise<IPlaylist | null> {
        return await playlistSchema.findOne({ title }).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers',
            populate: {
                path: 'performers',
                strictPopulate: true,
                select: 'name nickname',
            },
        });
    }

    public async getById(_id: string): Promise<IPlaylist | null> {
        return await playlistSchema.findById(_id);
    }

    public async getByIdPopulate(_id: string): Promise<IPlaylist | null> {
        return await playlistSchema.findById(_id).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers',
            populate: {
                path: 'performers',
                strictPopulate: true,
                select: 'name nickname',
            },
        });
    }

    public async getListByUserIdPopulate(userId: string) {
        return await playlistSchema.find({ userReference: userId }).populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail performers',
            populate: {
                path: 'performers',
                strictPopulate: true,
                select: 'name nickname',
            },
        });
    }

    public async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await playlistSchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }

    public async create(
        payload: Omit<IPlaylist, 'createdAt' | 'updatedAt'>,
    ): Promise<IPlaylist> {
        return await playlistSchema.create(payload);
    }

    public async updateByAction(
        _id: string,
        payload: { title: string; songId: string },
        typeAction: EnumActionUpdate,
    ): Promise<IPlaylist | null> {
        switch (typeAction) {
            case EnumActionUpdate.PUSH:
                return await playlistSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: { title: payload.title },
                        $push: { listSong: payload.songId },
                    },
                    { new: true },
                );
            case EnumActionUpdate.REMOVE:
                return await playlistSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: { title: payload.title },
                        $pull: { listSong: payload.songId },
                    },
                    { new: true },
                );
            default:
                return null;
        }
    }

    public async forceDelete(_id: string): Promise<IPlaylist | null> {
        return await playlistSchema.findByIdAndDelete(_id);
    }
}
