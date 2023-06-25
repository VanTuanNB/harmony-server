import IFavorite from '@/constraints/interfaces/IFavorite';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';
import { IsNotEmpty, IsUUID } from 'class-validator';

interface IFavoriteFilter extends Pick<IFavorite, 'listSong' | '_id'> {}

export default class FavoriteFilter {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsGenerateCollection()
    listSong: string[];

    constructor(props: IFavoriteFilter) {
        this._id = props._id;
        this.listSong = props.listSong;
    }
}
