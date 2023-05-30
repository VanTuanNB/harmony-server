import IAlbum from './IAlbum';
import IComposer from './IComposer';
import IGenre from './IGenre';
import ISongPath from './ISongPath';

export default interface ISong {
    _id: string;
    title: string;
    duration: number;
    thumbnail: string;
    composerId: Partial<IComposer>;
    publish: Date;
    albumId: Array<Partial<IAlbum>>;
    genresId: Array<Partial<IGenre>>;
    songPathId: Partial<ISongPath>;
    performers: Array<Partial<IComposer>>;
    views?: number;
    createdAt: Date;
    updatedAt: Date;
}
