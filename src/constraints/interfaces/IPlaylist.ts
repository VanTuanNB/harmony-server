

export default interface IPlaylist {
    _id: string;
    title: string;
    listSong: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
