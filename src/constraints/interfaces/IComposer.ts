import IAlbum from './IAlbum';
import ISong from './ISong';

export default interface IComposer {
    _id: string;
    name: string;
    avatar?: string;
    slug: string;
    country?: string;
    albumsId?: Array<Partial<IAlbum>>;
    songsId?: Array<Partial<ISong>>;
}
