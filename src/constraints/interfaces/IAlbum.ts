export default interface IAlbum {
    _id: string;
    title: string;
    publish: Date;
    composerReference: string;
    listSong?: string[];
    information?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
