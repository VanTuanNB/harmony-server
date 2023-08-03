import playlistSchema from '@/database/schemas/playlist.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class PlaylistModel {
    public static async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await playlistSchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }
}
