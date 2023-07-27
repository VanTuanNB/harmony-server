import { IAccountPendingVerify } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const accountPendingSchema = new Schema<IAccountPendingVerify>(
    {
        _id: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        verificationCode: { type: Number, required: true },
        verifyStatus: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IAccountPendingVerify>(
    'accountPendingVerify',
    accountPendingSchema,
);
