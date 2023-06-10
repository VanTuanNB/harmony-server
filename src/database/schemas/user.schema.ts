import { IUser } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true, maxlength: 40 },
        email: { type: String, required: true },
        avatar: {
            type: String,
            default:
                'https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg',
        },
        locale: { type: String, default: 'vi' },
        refreshToken: { type: String, required: true },
        playlistReference: [
            {
                type: String,
                ref: 'playlist',
            },
        ],
        favoriteListReference: { type: String, ref: 'favorite' },
        historyReference: { type: String, ref: 'history' },
        composerReference: { type: String, ref: 'composer' },
        isRegistrationForm: { type: Boolean, default: false },
        password: { type: String, default: null },
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IUser>('user', userSchema);
