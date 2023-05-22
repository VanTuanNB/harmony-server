import ISong from './ISong';

export default interface IGenre {
    _id: string;
    title: string;
    listSong: Array<Partial<ISong>>;
    createdAt?: Date;
    updatedAt?: Date;
}
