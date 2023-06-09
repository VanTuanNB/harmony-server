export default interface IComposer {
    _id: string;
    name: string;
    avatar?: string;
    nickname: string;
    country?: string;
    albumsReference?: string | string[];
    songsReference?: string | string[];
}
