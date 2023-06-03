

export default interface IUser {
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
