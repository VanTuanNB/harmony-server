import IThumbnailSong from '@/constraints/interfaces/IThumbnailSong';
import mongoose, { Schema } from 'mongoose';

const thumbnailSchema = new Schema<IThumbnailSong>(
    {
        _id: { type: String, required: true },
        path: { type: String, required: true },
    },
    {
        _id: false,
    },
);

export default mongoose.model<IThumbnailSong>('thumbnail', thumbnailSchema);
