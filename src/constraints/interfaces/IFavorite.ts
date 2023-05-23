import ISong from './ISong';

export default interface IFavorite {
    _id: string;
    listSong: Array<Partial<ISong>>;
}
