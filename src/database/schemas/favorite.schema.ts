import { IFavorite } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const favoriteSchema = new Schema<IFavorite>(
    {
        _id: { type: String, required: true },
        userReference: { type: String, required: true },
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

export default mongoose.model<IFavorite>('favorite', favoriteSchema);
