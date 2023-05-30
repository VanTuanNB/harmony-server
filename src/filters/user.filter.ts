import 'module-alias/register';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import IFavorite from '@/constraints/interfaces/IFavorite';
import IHistory from '@/constraints/interfaces/IHistory';
import IPlaylist from '@/constraints/interfaces/IPlaylist';
import IUser from '@/constraints/interfaces/IUser';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import IComposer from '@/constraints/interfaces/IComposer';

interface TypeProps extends Omit<IUser, 'createdAt' | 'updatedAt'> {}
export default class UserValidation implements TypeProps {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(20)
    name: string;

    @IsNotEmpty()
    @IsString()
    refreshToken: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsGenerateCollection<IComposer>({
        message: 'Filed _id in collection Composer is empty',
    })
    composerId?: Partial<IComposer>;

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
    favoriteListId?: Partial<IFavorite>;

    @IsOptional()
    @IsGenerateCollection<IHistory>({
        message: 'Filed _id in collection History is empty',
    })
    historyId?: Partial<IHistory>;

    @IsOptional()
    @IsGenerateCollection<IFavorite>({
        message: 'Filed _id in collection Playlist is empty',
    })
    playlistId?: Partial<IPlaylist>[];

    constructor(payload: TypeProps) {
        this._id = payload._id;
        this.email = payload.email;
        this.name = payload.name;
        this.refreshToken = payload.refreshToken;
        this.password = payload.password;
        this.avatar = payload.avatar;
        this.composerId = payload.composerId;
        this.favoriteListId = payload.favoriteListId;
        this.historyId = payload.historyId;
        this.playlistId = payload.playlistId;
        this.isRegistrationForm = payload.isRegistrationForm;
        this.locale = payload.locale;
    }
}
