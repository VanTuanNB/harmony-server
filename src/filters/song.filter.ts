import {
    ISong,
    IComposer,
    IAlbum,
} from '@/constraints/interfaces/index.interface';
import ISongPath from '@/constraints/interfaces/ISongPath';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

interface TypeProps extends Omit<ISong, 'createdAt' | 'updatedAt'> {}
export default class SongFilter implements TypeProps {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsNotEmpty()
    @IsDateString()
    publish: Date;

    @IsOptional()
    @IsGenerateCollection<ISongPath>({
        message: 'Property songPathId missing key _id',
    })
    songPathReference?: string;

    @IsGenerateCollection<IComposer>({
        message: 'Property composerId missing key _id',
    })
    composerReference: string;

    @IsOptional()
    @IsGenerateCollection<IAlbum>({
        message: 'Property albumId missing key _id in array type',
    })
    albumReference?: string[];

    @IsGenerateCollection<IAlbum>({
        message: 'Property genresId missing key _id in array type',
    })
    genresReference: string[];

    @IsGenerateCollection<IAlbum>({
        message: 'Property performers missing key _id in array type',
    })
    performers: string[];

    @IsOptional()
    @IsNumber()
    views?: number | undefined;

    constructor(params: TypeProps) {
        this._id = params._id;
        this.title = params.title;
        this.albumReference = params.albumReference;
        this.composerReference = params.composerReference;
        this.genresReference = params.genresReference;
        this.performers = params.performers;
        this.publish = params.publish;
        this.thumbnail = params.thumbnail;
        this.songPathReference = params.songPathReference;
        this.views = params.views;
    }
}
