import { IAlbum } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const albumSchema = new Schema<IAlbum>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        publish: { type: Date, required: true },
        information: { type: String, default: '' },
        thumbnail: { type: String, required: true, ref: 'thumbnail' },
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
