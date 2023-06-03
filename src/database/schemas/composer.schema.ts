import mongoose, { Schema } from 'mongoose';

import { IComposer } from '@/constraints/interfaces/index.interface';

const composerSchema = new Schema<IComposer>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        avatar: {
            type: String,
            default:
                'https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg',
        },
        country: { type: String, default: 'vi' },
        albumsReference: [
            {
                type: String,
                ref: 'album',
            },
        ],
        songsReference: [
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
