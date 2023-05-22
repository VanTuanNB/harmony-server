import mongoose, { Schema } from 'mongoose';

import { IComposer } from '@/constraints/interfaces/index.interface';

const composerSchema = new Schema<IComposer>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String, required: true },
        country: { type: String, required: true },
        slug: { type: String, required: true },
        albumsId: [
            {
                type: String,
                ref: 'album',
            },
        ],
        songsId: [
            {
                type: String,
                ref: 'song',
            },
        ],
    },
    {
        _id: false,
    },
);

export default mongoose.model<IComposer>('composer', composerSchema);
