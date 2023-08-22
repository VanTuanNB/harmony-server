import { v4 as uuidv4 } from 'uuid';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IPlaylist } from '@/constraints/interfaces/ICollection.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import PlaylistFilter from '@/filters/playlist.filter';
import ValidatePayload from '@/helpers/validate.helper';
import { playlistModel } from '@/instances/model.instance';

export default class PlaylistService {
    constructor() {}

    public async getListByUserId(
        userId: string,
    ): Promise<CustomResponse<IPlaylist[]>> {
        try {
            const playlists = await playlistModel.getListByUserIdPopulate(
                userId,
            );
            return {
                status: 200,
                success: true,
                message: 'GET_PLAYLIST_SUCCESSFULLY',
                data: playlists,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_PLAYLIST_FAILED',
                errors: error,
            };
        }
    }

    public async getById(
        playlistId: string,
    ): Promise<CustomResponse<IPlaylist | null>> {
        try {
            const playlist = await playlistModel.getByIdPopulate(playlistId);
            return {
                status: 200,
                success: true,
                message: 'GET_PLAYLIST_SUCCESSFULLY',
                data: playlist,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_PLAYLIST_FAILED',
                errors: error,
            };
        }
    }

    public async create(
        payload: Pick<IPlaylist, 'title'> & { userId: string },
    ): Promise<CustomResponse<IPlaylist>> {
        try {
            const currentPlaylist = await playlistModel.getByTitle(
                payload.title,
            );
            if (currentPlaylist)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const _id: string = uuidv4();
            const playlistFilter = new PlaylistFilter({
                _id,
                title: payload.title,
                listSong: [],
                userReference: payload.userId,
            });
            const validatePayload = await ValidatePayload(
                playlistFilter,
                'BAD_REQUEST',
                true,
            );
            if (validatePayload) return validatePayload;
            const created = await playlistModel.create(playlistFilter);
            return {
                status: 201,
                success: true,
                message: 'POST_PLAYLIST_SUCCESSFULLY',
                data: created,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_PLAYLIST_FAILED',
                errors: error,
            };
        }
    }

    public async update(
        _id: string,
        payload: {
            title: string;
            songId: string;
            typeAction: EnumActionUpdate;
        },
    ): Promise<CustomResponse<IPlaylist | null>> {
        try {
            if (!payload.songId || (payload.songId && !payload.typeAction))
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const currentPlaylist = await playlistModel.getById(_id);
            if (!currentPlaylist)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            switch (payload.typeAction) {
                case EnumActionUpdate.PUSH:
                    const isExits =
                        currentPlaylist.listSong.indexOf(payload.songId) !== -1;
                    if (isExits)
                        return {
                            status: 200,
                            success: true,
                            message: 'UPDATE_PLAYLIST_SUCCESSFULLY',
                            data: null,
                        };
                    const updated = await playlistModel.updateByAction(
                        _id,
                        {
                            title: payload.title,
                            songId: payload.songId,
                        },
                        payload.typeAction,
                    );
                    return {
                        status: 200,
                        success: true,
                        message: 'UPDATE_PLAYLIST_SUCCESSFULLY',
                        data: updated,
                    };
                case EnumActionUpdate.REMOVE:
                    const isExitsPlaylist =
                        currentPlaylist.listSong.indexOf(payload.songId) !== -1;
                    if (!isExitsPlaylist)
                        return {
                            status: 200,
                            success: true,
                            message: 'UPDATE_PLAYLIST_SUCCESSFULLY',
                            data: null,
                        };
                    const updateByPull = await playlistModel.updateByAction(
                        _id,
                        {
                            title: payload.title,
                            songId: payload.songId,
                        },
                        payload.typeAction,
                    );
                    return {
                        status: 200,
                        success: true,
                        message: 'UPDATE_PLAYLIST_SUCCESSFULLY',
                        data: updateByPull,
                    };
                default:
                    throw new Error('INVALID_TYPE_ACTON');
            }
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_PLAYLIST_FAILED',
                errors: error,
            };
        }
    }

    public async forceDelete(_id: string): Promise<CustomResponse> {
        try {
            const deleted = await playlistModel.forceDelete(_id);
            return {
                status: 200,
                success: true,
                message: 'FORCE_DELETE_PLAYLIST_SUCCESSFULLY',
                data: deleted,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'FORCE_DELETE_PLAYLIST_FAILED',
                errors: error,
            };
        }
    }
}
