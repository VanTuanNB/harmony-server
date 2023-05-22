import ISong from './ISong';

export default interface IAlbum {
    _id: string;
    title: string;
    publish: Date;
    listSong?: Array<Partial<ISong>>;
    information?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
