import { RoleConstant } from '@/constraints/enums/role.enum';
import { IUser } from '@/constraints/interfaces/index.interface';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true, maxlength: 40 },
        email: { type: String, required: true },
        avatarUrl: {
            type: String,
            default:
                'https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg',
        },
        avatarS3: {
            type: {
                bucketName: { type: String, required: true },
                keyObject: { type: String, required: true },
                contentType: { type: String, required: true },
            },
            default: null,
            _id: false,
        },
        locale: { type: String, default: 'vi' },
        refreshToken: { type: String, required: true },
        favoriteListReference: { type: String, ref: 'favorite' },
        historyReference: { type: String, ref: 'history' },
        role: { type: String, default: RoleConstant.USER },
        isRegistrationForm: { type: Boolean, default: false },
        password: { type: String, default: null },
        playlistReference: [{ type: String, ref: 'playlist' }],
        nickname: { type: String, default: '' },
        isPendingUpgradeComposer: { type: Boolean, default: false },
        albumsReference: [
            {
                type: String,
                ref: 'album',
            },
        ],
        songsReference: [
            {
                type: String,
                ref: 'song',
            },
        ],
    },
    {
        _id: false,
        timestamps: true,
    },
);

export default mongoose.model<IUser>('user', userSchema);
