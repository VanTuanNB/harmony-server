import { ISongDraftUpload } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const songDraftSchema = new Schema<ISongDraftUpload>(
    {
        _id: { type: String, required: true },
        audio: {
            bucketName: { type: String, required: true },
            keyObject: { type: String, required: true },
            expiredTime: { type: Number, required: true },
            contentType: { type: String, required: true },
        },
        thumbnail: {
            type: {
                bucketName: { type: String, required: true },
                keyObject: { type: String, required: true },
                expiredTime: { type: Number, required: true },
                contentType: { type: String, required: true },
            },
            default: null,
            _id: false,
        },
        userReference: { type: String, required: true, ref: 'user' },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model('songDraft', songDraftSchema);
