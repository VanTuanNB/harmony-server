import { IPlaylist } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const playlistSchema = new Schema<IPlaylist>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        listSong: [
            {
                type: String,
                ref: 'song',
            },
        ],
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IPlaylist>('playlist', playlistSchema);
