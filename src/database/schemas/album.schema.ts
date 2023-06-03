import { IAlbum } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const albumSchema = new Schema<IAlbum>(
    {
        _id: { type: String, required: true },
        title: { type: String, required: true },
        publish: { type: Date, required: true },
        information: { type: String, default: '' },
        composerReference: { type: String, required: true, ref: 'composer' },
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
