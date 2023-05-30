import IAlbum from '@/constraints/interfaces/IAlbum';
import IComposer from '@/constraints/interfaces/IComposer';
import IGenre from '@/constraints/interfaces/IGenre';
import ISong from '@/constraints/interfaces/ISong';
import ISongPath from '@/constraints/interfaces/ISongPath';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

interface TypeProps extends Omit<ISong, 'createdAt' | 'updatedAt'> {}
export default class SongFilter implements TypeProps {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    thumbnail: string;

    @IsNotEmpty()
    @IsDateString()
    publish: Date;

    @IsNotEmpty()
    @IsNumber()
    duration: number;

    @IsGenerateCollection<ISongPath>({
        message: 'Property songPathId missing key _id',
    })
    songPathId: Partial<ISongPath>;

    @IsGenerateCollection<IComposer>({
        message: 'Property composerId missing key _id',
    })
    composerId: Partial<IComposer>;

    @IsGenerateCollection<IAlbum>({
        message: 'Property albumId missing key _id in array type',
    })
    albumId: Partial<IAlbum>[];

    @IsGenerateCollection<IAlbum>({
        message: 'Property genresId missing key _id in array type',
    })
    genresId: Partial<IGenre>[];

    @IsGenerateCollection<IAlbum>({
        message: 'Property performers missing key _id in array type',
    })
    performers: Partial<IComposer>[];

    @IsNumber()
    views?: number | undefined;

    constructor(params: TypeProps) {
        this._id = params._id;
        this.title = params.title;
        this.albumId = params.albumId;
        this.composerId = params.composerId;
        this.duration = params.duration;
        this.genresId = params.genresId;
        this.performers = params.performers;
        this.publish = params.publish;
        this.thumbnail = params.thumbnail;
        this.songPathId = params.songPathId;
        this.views = params.views;
    }
}
