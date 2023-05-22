export default interface IFavorite {
    _id: string;
    listSong: { _id: string; ref: string }[];
}
