import { IUser } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        avatar: { type: String, default: '' },
        locale: { type: String, default: 'vi' },
        refreshToken: { type: String, required: true },
        playlistId: [
            {
                type: String,
                ref: 'playlist',
            },
        ],
        favoriteListId: { type: String, ref: 'favorite' },
        historyId: { type: String, ref: 'history' },
        composerId: { type: String, ref: 'composer' },
        isRegistrationForm: { type: Boolean, default: false },
        password: { type: String, default: null },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IUser>('user', userSchema);
