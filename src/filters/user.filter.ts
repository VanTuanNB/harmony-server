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
    @MaxLength(40)
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
    composerReference?: string;

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
    @IsGenerateCollection<IFavorite>({
        message: 'Filed _id in collection Playlist is empty',
    })
    playlistReference?: string[];

    constructor(payload: TypeProps) {
        this._id = payload._id;
        this.email = payload.email;
        this.name = payload.name;
        this.refreshToken = payload.refreshToken;
        this.password = payload.password;
        this.avatar = payload.avatar;
        this.composerReference = payload.composerReference;
        this.favoriteListReference = payload.favoriteListReference;
        this.historyReference = payload.historyReference;
        this.playlistReference = payload.playlistReference;
        this.isRegistrationForm = payload.isRegistrationForm;
        this.locale = payload.locale;
    }
}
