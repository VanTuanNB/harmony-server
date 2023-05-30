import { ISong } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const songSchema = new Schema<ISong>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        duration: { type: Number, required: true },
        publish: { type: Date, required: true },
        thumbnail: { type: String, required: true },
        performers: [
            {
                type: String,
                ref: 'composer',
                required: true,
            },
        ],
        composerId: { type: String, required: true, ref: 'composer' },
        albumId: [{ type: String, required: true, ref: 'album' }],
        genresId: [
            {
                type: String,
                ref: 'genre',
                required: true,
            },
        ],
        songPathId: { type: String, required: true, ref: 'songPath' },
        views: { type: Number, default: 0 },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<ISong>('song', songSchema);
