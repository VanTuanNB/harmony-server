//
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { RoleConstant } from '@/constraints/enums/role.enum';
import {
    IFavorite,
    IHistory,
    IUser,
} from '@/constraints/interfaces/index.interface';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';

interface TypeProps extends Omit<IUser, 'createdAt' | 'updatedAt'> {}
export default class UserValidation implements TypeProps {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(40)
    name: string;

    @IsNotEmpty()
    @IsString()
    refreshToken: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsObject()
    avatarS3: {
        bucketName: string;
        keyObject: string;
        contentType: string;
    } | null;

    @IsOptional()
    @IsBoolean()
    isRegistrationForm?: boolean;

    @IsOptional()
    @IsString()
    locale?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsGenerateCollection<IFavorite>({
        message: 'Filed _id in collection Favorite is empty',
    })
    favoriteListReference?: string;

    @IsOptional()
    @IsGenerateCollection<IHistory>({
        message: 'Filed _id in collection History is empty',
    })
    historyReference?: string;

    @IsOptional()
    @IsGenerateCollection()
    playlistReference?: string[];

    @IsNotEmpty()
    @IsString()
    role: RoleConstant.USER | RoleConstant.COMPOSER;

    @IsOptional()
    @IsString()
    nickname?: string;

    @IsOptional()
    @IsGenerateCollection()
    albumsReference?: string[];

    @IsOptional()
    @IsGenerateCollection()
    songsReference?: string[];

    @IsOptional()
    @IsBoolean()
    isPendingUpgradeComposer?: boolean;

    constructor(payload: TypeProps) {
        this._id = payload._id;
        this.email = payload.email;
        this.name = payload.name;
        this.refreshToken = payload.refreshToken;
        this.password = payload.password;
        this.avatarUrl = payload.avatarUrl;
        this.avatarS3 = payload.avatarS3;
        this.favoriteListReference = payload.favoriteListReference;
        this.historyReference = payload.historyReference;
        this.isRegistrationForm = payload.isRegistrationForm;
        this.locale = payload.locale;
        this.playlistReference = payload.playlistReference;
        this.role = payload.role;
        this.nickname = payload.nickname;
        this.albumsReference = payload.albumsReference;
        this.songsReference = payload.songsReference;
        this.isPendingUpgradeComposer = payload.isPendingUpgradeComposer;
    }
}
