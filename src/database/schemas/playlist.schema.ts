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
        userReference: { type: String, required: true, ref: 'user' },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IPlaylist>('playlist', playlistSchema);
