import mongoose, { Schema } from 'mongoose';

import { IAdmin } from '@/constraints/interfaces/index.interface';

const adminSchema = new Schema<IAdmin>(
    {
        _id: { type: String, required: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        refreshToken: { type: String, required: true },
        role: { type: String, required: true },
        avatar: {
            type: String,
            default:
                'https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg',
        },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IAdmin>('admin', adminSchema);
