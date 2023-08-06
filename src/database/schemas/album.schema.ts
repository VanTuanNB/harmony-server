import { IAlbum } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const albumSchema = new Schema<IAlbum>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        publish: { type: Date, required: true },
        information: { type: String, default: '' },
        thumbnailUrl: { type: String, default: null },
        thumbnail: {
            type: {
                bucketName: { type: String, required: true },
                keyObject: { type: String, required: true },
                contentType: { type: String, required: true },
            },
            default: null,
            _id: false,
        },
        userReference: { type: String, required: true, ref: 'user' },
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

export default mongoose.model<IAlbum>('album', albumSchema);
