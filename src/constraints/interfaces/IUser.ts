import IFavorite from './IFavorite';
import IHistory from './IHistory';
import IPlaylist from './IPlaylist';

export default interface IUser {
    _id: string;
    email: string;
    name: string;
    refreshToken: string;
    password?: string | null;
    avatar?: string;
    locale?: string | null;
    playlistId?: Array<Partial<IPlaylist>>;
    favoriteListId?: Partial<IFavorite>;
    historyId?: Partial<IHistory>;
    isRegistrationForm?: boolean;
    composerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
