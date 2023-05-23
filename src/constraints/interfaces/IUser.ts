import IComposer from './IComposer';
import IFavorite from './IFavorite';
import IHistory from './IHistory';
import IPlaylist from './IPlaylist';

export default interface IUser {
    _id: string;
    email: string;
    name: string;
    refreshToken: string;
    password?: string;
    avatar?: string;
    locale?: string;
    playlistId?: Array<Partial<IPlaylist>>;
    favoriteListId?: Partial<IFavorite>;
    historyId?: Partial<IHistory>;
    isRegistrationForm?: boolean;
    composerId?: Partial<IComposer>;
    createdAt?: Date;
    updatedAt?: Date;
}
