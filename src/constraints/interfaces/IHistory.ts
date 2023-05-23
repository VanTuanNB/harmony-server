import ISong from './ISong';

export default interface IHistory {
    _id: string;
    listSong: Array<Partial<ISong>>;
}
