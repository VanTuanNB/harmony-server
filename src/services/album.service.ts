import { v4 as uuidv4 } from 'uuid';

import { IAlbum } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import AlbumModel from '@/models/album.model';
import ComposerModel from '@/models/composer.model';
import ComposerService from './composer.service';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import SongModel from '@/models/song.model';

export default class AlbumService {
    public static async create(
        payload: Pick<IAlbum, 'title' | 'publish' | 'composerReference'>,
    ): Promise<CustomResponse> {
        try {
            const _id: string = uuidv4();
            const composer = await ComposerModel.getById(
                payload.composerReference,
            );
            if (!composer)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_COMPOSER_NOT_FOUND',
                };
            const albumByComposer = await AlbumModel.getByComposerAndTitle(
                payload.composerReference,
                payload.title,
            );
            if (albumByComposer)
                return {
                    status: 400,
                    success: false,
                    message: 'TITLE_ALBUM_IS_EXISTING',
                };

            const newAlbum = await AlbumModel.create({
                _id,
                ...payload,
            });
            await ComposerService.updateFieldGenre(
                payload.composerReference,
                newAlbum._id,
            );
            return {
                status: 201,
                success: true,
                message: 'POST_ALBUM_SUCCESSFULLY',
                data: newAlbum,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_ALBUM_FAILED',
                errors: error,
            };
        }
    }

    public static async updateChangesSong(
        id: string,
        songReference: string,
        typeAction: string,
    ): Promise<CustomResponse> {
        try {
            const currentAlbum = await AlbumModel.getById(id);
            if (!currentAlbum)
                return {
                    status: 400,
                    success: false,
                    message: 'ALBUM_NOT_FOUND',
                };
            switch (typeAction) {
                case EnumActionUpdate.PUSH:
                    const albumHasSongReference =
                        await AlbumModel.getBySongReference(id, songReference);
                    if (albumHasSongReference)
                        return {
                            status: 400,
                            success: false,
                            message: 'SONG_NOT_EXIST_IN_THIS_ALBUM',
                        };
                    const updateThisAlbum = await AlbumModel.updatedField(id, {
                        listSong: [songReference],
                    });
                    if (!updateThisAlbum)
                        throw new Error('UPDATE_THIS_ALBUM_PUSH_FAILED');
                    await SongModel.updateByAction(
                        songReference,
                        {
                            albumReference: [updateThisAlbum._id],
                        },
                        EnumActionUpdate.PUSH,
                    );
                    return {
                        status: 200,
                        success: true,
                        message: 'ALBUM_PUSH_SONG_SUCCESSFULLY',
                    };
                case EnumActionUpdate.REMOVE:
                    const currentAlbumHasSongReference =
                        await AlbumModel.getBySongReference(id, songReference);
                    if (!currentAlbumHasSongReference)
                        return {
                            status: 400,
                            success: false,
                            message: 'SONG_NOT_ALREADY_EXISTS_IN_THIS_ALBUM',
                        };
                    const updatedListSongAlbum =
                        await AlbumModel.updatedFieldByActionRemove(id, {
                            listSong: songReference as any,
                        });
                    if (!updatedListSongAlbum)
                        throw new Error('UPDATE_THIS_ALBUM_REMOVE_FAILED');
                    await SongModel.updateByAction(
                        songReference,
                        {
                            albumReference: updatedListSongAlbum._id as any,
                        },
                        EnumActionUpdate.REMOVE,
                    );
                    return {
                        status: 200,
                        success: true,
                        message: 'ALBUM_REMOVE_SONG_SUCCESSFULLY',
                    };
                default:
                    return {
                        status: 400,
                        success: false,
                        message: 'INVALID_ACTION_TYPE',
                    };
            }
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'PUT_ALBUM_FAILED',
                errors: error,
            };
        }
    }

    public static async updateMultipleCollection(
        listIdAlbum: string[],
        songId: string,
    ): Promise<boolean> {
        try {
            listIdAlbum.forEach(async (id: string) => {
                await AlbumModel.updatedField(id, {
                    listSong: [songId],
                });
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public static async getAlbumNewWeek(item: number): Promise<CustomResponse> {
        try {
            const albumNew = await AlbumModel.getAlbumNewWeek(item);
            if (item == 0) return {
                status: 400,
                success: false,
                message: 'QUERY_ITEM_NOT_EXITS',
            }

            return {
                status: 200,
                success: true,
                message: 'GET_ALBUM_NEW_WEEK_SUCCESSFULLY',
                data: albumNew,
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_ALBUM_NEW_WEEK_FAILED',
                errors: error,
            };
        }
    }
}
