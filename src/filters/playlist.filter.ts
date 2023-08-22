import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { IPlaylist } from '@/constraints/interfaces/index.interface';

interface IPlaylistFilter extends Omit<IPlaylist, 'createdAt' | 'updatedAt'> {}
export default class PlaylistFilter implements IPlaylistFilter {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsUUID()
    userReference: string;

    @IsArray()
    listSong: string[];

    constructor(props: IPlaylistFilter) {
        this._id = props._id;
        this.userReference = props.userReference;
        this.listSong = props.listSong;
        this.title = props.title;
    }
}
