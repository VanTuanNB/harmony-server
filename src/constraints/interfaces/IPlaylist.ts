export default interface IPlaylist {
    _id: string;
    title: string;
    listSong: { _id: string; ref: string }[];
    createdAt?: Date;
    updatedAt?: Date;
}
