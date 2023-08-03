import { ISong } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const songSchema = new Schema<ISong>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        publish: { type: Date, required: true },
        thumbnail: { type: String, required: true, ref: 'thumbnail' },
        performers: [
            {
                type: String,
                ref: 'user',
                required: true,
            },
        ],
        userReference: { type: String, required: true, ref: 'user' },
        albumReference: [{ type: String, ref: 'album' }],
        genresReference: [
            {
                type: String,
                ref: 'genre',
                required: true,
            },
        ],
        // songPathReference: { type: String, required: true, ref: 'songPath' },
        audio: {
            type: {
                bucketName: { type: String, required: true },
                keyObject: { type: String, required: true },
                contentType: { type: String, required: true },
            },
            required: true,
        },
        views: { type: Number, default: 0 },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<ISong>('song', songSchema);
