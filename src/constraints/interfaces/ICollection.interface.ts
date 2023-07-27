export interface ISong {
    _id: string;
    title: string;
    thumbnail?: string;
    composerReference: string;
    songPathReference?: string;
    publish: Date;
    albumReference?: string[];
    genresReference: string[];
    performers: Array<string>;
    views?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGenre {
    _id: string;
    title: string;
    listSong?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHistory {
    _id: string;
    listSong: string[];
    createdAt?: string;
    updatedAt?: Date;
}

export interface IComposer {
    _id: string;
    name: string;
    avatar?: string;
    nickname: string;
    country?: string;
    userReference: string;
    albumsReference?: string | string[];
    songsReference?: string | string[];
}

export interface IFavorite {
    _id: string;
    listSong: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IThumbnailSong {
    _id: string;
    path: string;
}

export interface IUser {
    _id: string;
    email: string;
    name: string;
    refreshToken: string;
    password?: string;
    avatar?: string;
    locale?: string;
    playlistReference?: string[];
    favoriteListReference?: string;
    historyReference?: string;
    isRegistrationForm?: boolean;
    composerReference?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAccountPendingVerify {
    _id: string;
    username: string;
    email: string;
    password: string;
    verificationCode: number;
    verifyStatus?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAlbum {
    _id: string;
    title: string;
    publish: Date;
    composerReference: string;
    listSong?: string[];
    thumbnail?: string;
    information?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPlaylist {
    _id: string;
    title: string;
    listSong: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
