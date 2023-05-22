import { ISongPath } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const songPathSchema = new Schema<ISongPath>(
    {
        _id: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
    },
    {
        _id: false,
    },
);

export default mongoose.model('songPath', songPathSchema);
