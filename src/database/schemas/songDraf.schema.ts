import { ISongDraftUpload } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const songDraftSchema = new Schema<ISongDraftUpload>(
    {
        _id: { type: String, required: true },
        bucketName: { type: String, required: true },
        keyObject: { type: String, required: true },
        expiredTime: { type: Number, required: true },
        contentType: { type: String, required: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model('songDraft', songDraftSchema);
