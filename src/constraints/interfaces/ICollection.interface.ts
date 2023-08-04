import { RoleConstant } from '../enums/role.enum';
import { EContentTypeObjectS3 } from '../enums/s3.enum';

export interface ISong {
    _id: string;
    title: string;
    thumbnailUrl: string;
    userReference: string;
    thumbnail: {
        bucketName: string;
        keyObject: string;
        contentType: EContentTypeObjectS3;
    };
    audio: {
        bucketName: string;
        keyObject: string;
        contentType: EContentTypeObjectS3.AUDIO;
    };
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
    role: RoleConstant.USER | RoleConstant.COMPOSER;
    nickname?: string;
    albumsReference?: string[];
    songsReference?: string[];
    isPendingUpgradeComposer?: boolean;
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
    userReference: string;
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
    userReference: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISongDraftUpload {
    _id: string;
    thumbnail: {
        bucketName: string;
        keyObject: string;
        expiredTime: number;
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.PNG
            | EContentTypeObjectS3.JPG;
    } | null;
    audio: {
        bucketName: string;
        keyObject: string;
        expiredTime: number;
        contentType: EContentTypeObjectS3.AUDIO;
    };
    userReference: string;
    createdAt?: Date;
    updatedAt?: Date;
}
