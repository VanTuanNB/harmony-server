import mongoose, { Schema } from 'mongoose';

import { IAdmin } from '@/constraints/interfaces/index.interface';

const adminSchema = new Schema<IAdmin>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        refreshToken: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IAdmin>('admin', adminSchema);
