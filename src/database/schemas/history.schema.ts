import { IHistory } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const historySchema = new Schema<IHistory>(
    {
        _id: { type: String, required: true },
        listSong: [
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

export default mongoose.model<IHistory>('history', historySchema);
