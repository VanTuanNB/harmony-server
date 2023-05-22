import { IGenre } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const genreSchema = new Schema<IGenre>(
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

export default mongoose.model<IGenre>('genre', genreSchema);
