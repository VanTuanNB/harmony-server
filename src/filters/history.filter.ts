import { IsNotEmpty, IsUUID } from 'class-validator';

import { IHistory } from '@/constraints/interfaces/index.interface';
import IsGenerateCollection from '@/decorators/IsGenerateCollection.decorator';

interface IHistoryFilter extends Omit<IHistory, 'createdAt' | 'updatedAt'> {}
export default class HistoryFilter implements IHistoryFilter {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsGenerateCollection()
    listSong: string[];

    constructor(props: IHistoryFilter) {
        this._id = props._id;
        this.listSong = props.listSong;
    }
}
