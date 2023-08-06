import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import {
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export default class AlbumFilter implements IAlbum {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    thumbnailUrl: string | null;

    @IsOptional()
    @IsObject()
    thumbnail: {
        bucketName: string;
        keyObject: string;
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG;
    } | null;

    @IsGenerateCollection()
    listSong: string[];

    @IsGenerateCollection()
    userReference: string;

    @IsDateString()
    publish: Date;

    constructor(props: IAlbum) {
        this._id = props._id;
        this.title = props.title;
        this.thumbnailUrl = props.thumbnailUrl;
        this.thumbnail = props.thumbnail;
        this.userReference = props.userReference;
        this.listSong = props.listSong;
        this.publish = props.publish;
    }
}
