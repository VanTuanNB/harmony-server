import { IFavorite } from '@/constraints/interfaces/index.interface';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import { IsNotEmpty, IsUUID } from 'class-validator';

export default class FavoriteFilter implements IFavorite {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsNotEmpty()
    @IsUUID()
    userReference: string;

    @IsGenerateCollection()
    listSong: string[];

    constructor(props: IFavorite) {
        this._id = props._id;
        this.listSong = props.listSong;
        this.userReference = props.userReference;
    }
}
