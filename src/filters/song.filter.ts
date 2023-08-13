import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import {
    ISong,
    IAlbum,
} from '@/constraints/interfaces/index.interface';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsObject,
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
    thumbnailUrl: string;

    @IsNotEmpty()
    @IsDateString()
    publish: Date;

    @IsNotEmpty()
    @IsObject()
    thumbnail: {
        bucketName: string;
        keyObject: string;
        contentType: EContentTypeObjectS3;
    };

    @IsNotEmpty()
    @IsObject()
    audio: {
        bucketName: string;
        keyObject: string;
        contentType: EContentTypeObjectS3.AUDIO;
    };

    @IsGenerateCollection({
        message: 'Property composerId missing key _id',
    })
    userReference: string;

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
        this.userReference = params.userReference;
        this.genresReference = params.genresReference;
        this.performers = params.performers;
        this.publish = params.publish;
        this.thumbnail = params.thumbnail;
        this.thumbnailUrl = params.thumbnailUrl;
        this.audio = params.audio;
        this.views = params.views;
    }
}
