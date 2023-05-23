import ISong from './ISong';

export default interface IPlaylist {
    _id: string;
    title: string;
    listSong: Array<Partial<ISong>>;
    createdAt?: Date;
    updatedAt?: Date;
}
