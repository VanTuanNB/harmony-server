import { config } from 'dotenv';
config();
import fs from 'fs';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';
import { ISong } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import SongRepository from '@/repositories/song.repository';
import SongFilter from '@/filters/song.filter';
import ValidatePayload from '@/helpers/validate.helper';
import handleDeleteFile from '@/helpers/deleteFile.helper';
import ThumbnailModel from '@/models/thumbnail.model';
import SongPathModel from '@/models/songPath.model';
import SongModel from '@/models/song.model';
import ComposerModel from '@/models/composer.model';
import GenreService from './genre.service';
import AlbumService from './album.service';
import ComposerService from './composer.service';
import ThumbnailRepository from '@/repositories/thumbnail.repository';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import GenreModel from '@/models/genre.model';
import AlbumModel from '@/models/album.model';
import { pathFromSystem } from '@/utils/pathSystemLinux.util';

export interface ITypeFiles {
    thumbnail: Express.Multer.File;
    fileSong: Express.Multer.File;
}

export interface IFsStreamSong {
    isRange: boolean;
    fileSize: number;
    fileStream: fs.ReadStream;
    chunkSize?: number;
    resHeader: {
        [type: string]: string | number;
    };
}

interface IPayloadUpdate
    extends Partial<Pick<ISong, 'title' | 'publish'>>,
    Partial<ITypeFiles> {
    genreInstance: {
        typeAction: EnumActionUpdate;
        payloadNeedUpdated: string[];
    };
    albumInstance: {
        typeAction: EnumActionUpdate;
        payloadNeedUpdated: string[];
    };
    performerInstance: {
        typeAction: EnumActionUpdate;
        payloadNeedUpdated: string[];
    };
}

export default class SongService {
    public static async getAll(): Promise<CustomResponse<ISong[] | []>> {
        try {
            const songs = await SongModel.getAll();
            return {
                status: 200,
                success: true,
                message: 'GET_ALL_SONG_SUCCESSFULLY',
                data: songs,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ALL_SONG_FAILED',
                errors: error,
            };
        }
    }

    public static async getById(
        _id: string,
    ): Promise<CustomResponse<ISong | null>> {
        try {
            const song = await SongModel.getById(_id);
            if (!song)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_SONG_BY_ID_EXISTS',
                };

            return {
                status: 200,
                success: true,
                message: 'GET_SONG_BY_ID_SUCCESSFULLY',
                data: song,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_SONG_BY_ID_FAILED',
            };
        }
    }

    public static async search(
        title: string,
    ): Promise<CustomResponse<ISong | {}>> {
        try {
            const song = await SongModel.search(title);
            const album = await AlbumModel.search(title)
            const composer = await ComposerModel.search(title)

            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(title);

            if (hasSpecialChar)
                return {
                    status: 400,
                    success: false,
                    message: 'INPUT_HAS_SECIAL_CHARACTER',
                }

            const data = {
                songs: song,
                albums: album,
                composer: composer
            }

            return {
                status: 200,
                success: true,
                message: 'GET_SONG_AND_ALBUM_SEARCH_SUCCESSFULLY',
                data: data,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_SONG_AND_ALBUM_FAILED',
            };
        }
    }


    public static async getFsStreamSong(
        idSong: string,
        range: string | undefined,
    ): Promise<CustomResponse<IFsStreamSong>> {
        try {
            const currentSong = await SongModel.getByIdSelectSongPathReference(
                idSong,
            );
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_STREAM_SONG_NOT_EXIST',
                };
            const filePath = await SongPathModel.getById(
                currentSong.songPathReference as string,
            );
            if (!filePath)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_STREAM_SONG_ID_NOT_FOUND',
                };
            if (range) {
                const [start, end] = range.replace('bytes=', '').split('-');
                const startByte = parseInt(start, 10);
                const endByte = end ? parseInt(end, 10) : filePath.size - 1;
                const chunkSize = endByte - startByte + 1;
                const fileStream = fs.createReadStream(filePath.path, {
                    start: startByte,
                    end: endByte,
                });
                return {
                    status: 206,
                    success: true,
                    message: 'GET_FS_STREAM_SONG_SUCCESSFULLY',
                    data: {
                        isRange: true,
                        chunkSize,
                        fileStream,
                        fileSize: filePath.size,
                        resHeader: {
                            'Content-Range': `bytes ${startByte}-${endByte}/${filePath.size}`,
                            'Accept-Ranges': 'bytes',
                            'Content-Length': chunkSize,
                            'Content-Type': 'audio/mpeg',
                        },
                    },
                };
            } else {
                const fileStream = fs.createReadStream(filePath.path);
                return {
                    status: 200,
                    success: true,
                    message: 'GET_FS_STREAM_SONG_SUCCESSFULLY',
                    data: {
                        isRange: false,
                        fileStream,
                        fileSize: filePath.size,
                        resHeader: {
                            'Content-Length': filePath.size,
                            'Content-Type': 'audio/mpeg',
                            'Accept-Ranges': 'bytes',
                        },
                    },
                };
            }
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_STREAM_SONG_FAILED',
                errors: error,
            };
        }
    }

    public static async validateTitleUploadSong(
        title: string,
        composerReference: string,
        files: ITypeFiles,
    ): Promise<CustomResponse> {
        try {
            const composer = await ComposerService.getById(composerReference);
            if (!composer) {
                handleDeleteFile(files.fileSong);
                handleDeleteFile(files.thumbnail);
                return {
                    status: 400,
                    success: false,
                    message: 'COMPOSER_NOT_EXIST',
                };
            }
            const listSongOfComposer = await ComposerService.getListSongById(
                composerReference,
            );
            const songs = listSongOfComposer.data!.songsReference as any[];
            const isDuplicated = songs.some(
                (song: ISong) =>
                    song.title.toLowerCase() === title.toLowerCase(),
            );
            if (isDuplicated) {
                handleDeleteFile(files.fileSong);
                handleDeleteFile(files.thumbnail);
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_DUPLICATED_TITLE',
                };
            }
            return {
                status: 200,
                success: true,
                message: 'TRANSFER_NEXT_FUNCTION',
            };
        } catch (error) {
            console.log(error);
            handleDeleteFile(files.fileSong);
            handleDeleteFile(files.thumbnail);
            return {
                status: 500,
                success: false,
                message: 'UPLOAD_SONG_FAILED',
                errors: error,
            };
        }
    }

    public static async create(
        files: ITypeFiles,
        payload: Omit<
            ISong,
            | '_id'
            | 'duration'
            | 'thumbnail'
            | 'createdAt'
            | 'updatedAt'
            | 'songPathId'
        >,
    ): Promise<CustomResponse> {
        try {
            Object.assign(payload, {
                albumReference: payload.albumReference
                    ? JSON.parse(payload.albumReference as any)
                    : undefined,
                genresReference: JSON.parse(payload.genresReference as any),
                performers: JSON.parse(payload.performers as any),
            });
            const fileSongInfo = await SongRepository.getInformationFileSong(
                files.fileSong,
            );
            const _id = uuidv4();
            const songFilter = new SongFilter({
                ...payload,
                _id,
            });

            const songInValid = await ValidatePayload(
                songFilter,
                'BAD_REQUEST',
                true,
            );
            if (songInValid) return songInValid;
            const createThumbnail = await ThumbnailModel.create({
                _id: uuidv4(),
                path: pathFromSystem(files.thumbnail.path, process.platform),
            });
            const createSongPath = await SongPathModel.create({
                _id: uuidv4(),
                path: pathFromSystem(files.fileSong.path, process.platform),
                size: fileSongInfo.format.size as number,
                duration: fileSongInfo.format.duration as number,
                type: files.fileSong.mimetype,
            });
            Object.assign(songFilter, {
                thumbnail: `${process.env.SERVER_URL}:${process.env.PORT_SERVER}/api/v1/thumbnail/${createThumbnail._id}`,
                songPathReference: createSongPath._id,
            });

            const createdSong = await SongModel.create(songFilter);
            const injectorComposer = await ComposerModel.updatedField(
                payload.composerReference,
                { songsReference: createdSong._id },
            );
            const injectorGenre = await GenreService.updateMultipleCollection(
                payload.genresReference as string[],
                createdSong._id,
            );
            if (!!payload.albumReference) {
                await AlbumService.updateMultipleCollection(
                    payload.albumReference as string[],
                    createdSong._id,
                );
            }
            if (!injectorComposer || !injectorGenre) {
                await ThumbnailModel.forceDelete(createThumbnail._id);
                await SongPathModel.forceDelete(createSongPath._id);
                await SongModel.forceDelete(createdSong._id);
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_NOT_EXIST_COMPOSER',
                };
            }
            return {
                status: 201,
                success: true,
                message: 'POST_SONG_SUCCESSFULLY',
                data: createdSong,
            };
        } catch (error) {
            console.log(error);
            handleDeleteFile(files.fileSong);
            handleDeleteFile(files.thumbnail);
            return {
                status: 500,
                success: false,
                message: 'POST_SONG_FAILED',
                errors: error,
            };
        }
    }

    public static async update(
        id: string,
        payload: IPayloadUpdate,
    ): Promise<CustomResponse> {
        try {
            Object.assign(payload, {
                genreInstance: payload.genreInstance
                    ? JSON.parse(payload.genreInstance as any)
                    : undefined,
                albumInstance: payload.albumInstance
                    ? JSON.parse(payload.albumInstance as any)
                    : undefined,
                performerInstance: payload.performerInstance
                    ? JSON.parse(payload.performerInstance as any)
                    : undefined,
            });
            const currentSong = await SongModel.getByIdNoPopulate(id);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'ID_SONG_NOT_EXIST',
                };
            const conditionGenreUpdate =
                payload.genreInstance &&
                payload.genreInstance.typeAction !== EnumActionUpdate.NOTHING &&
                payload.genreInstance.payloadNeedUpdated.length > 0;
            const conditionAlbumUpdate =
                payload.albumInstance &&
                payload.albumInstance.typeAction !== EnumActionUpdate.NOTHING &&
                payload.albumInstance.payloadNeedUpdated.length > 0;
            const conditionPerformerUpdate =
                payload.performerInstance &&
                payload.performerInstance.typeAction !==
                EnumActionUpdate.NOTHING &&
                payload.performerInstance.payloadNeedUpdated.length > 0;
            if (conditionGenreUpdate) {
                const multipleRecordGenres =
                    await GenreModel.getMultipleBySongReference(
                        payload.genreInstance.payloadNeedUpdated,
                        id,
                    );
                switch (payload.genreInstance.typeAction) {
                    case EnumActionUpdate.PUSH:
                        const allowInRecordSongPush =
                            currentSong.genresReference?.every(
                                (record) =>
                                    payload.genreInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) !== -1,
                            );
                        if (
                            multipleRecordGenres.length > 0 &&
                            allowInRecordSongPush
                        )
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.genreInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_ALREADY_EXIST`,
                            };
                        break;
                    case EnumActionUpdate.REMOVE:
                        const allowInRecordSongRemove =
                            currentSong.genresReference?.every(
                                (record) =>
                                    payload.genreInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) === -1,
                            );
                        if (
                            multipleRecordGenres.length === 0 &&
                            allowInRecordSongRemove
                        )
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.genreInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_NOT_YET_ALREADY_EXIST`,
                            };
                        break;
                    default:
                        break;
                }
            }
            if (conditionAlbumUpdate) {
                const multipleRecordGenres =
                    await AlbumModel.getMultipleBySongReference(
                        payload.albumInstance.payloadNeedUpdated,
                        id,
                    );
                switch (payload.albumInstance.typeAction) {
                    case EnumActionUpdate.PUSH:
                        const allowInRecordSongPush =
                            currentSong.albumReference?.every(
                                (record) =>
                                    payload.albumInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) === -1,
                            );
                        if (
                            multipleRecordGenres.length > 0 &&
                            allowInRecordSongPush
                        )
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_ALREADY_EXIST`,
                            };
                        break;
                    case EnumActionUpdate.REMOVE:
                        const allowInRecordSongRemove =
                            currentSong.albumReference?.every(
                                (record) =>
                                    payload.albumInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) !== -1,
                            );
                        if (
                            multipleRecordGenres.length === 0 &&
                            allowInRecordSongRemove
                        )
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_NOT_YET_ALREADY_EXIST`,
                            };
                        break;
                    default:
                        break;
                }
            }
            if (conditionPerformerUpdate) {
                const existComposer = await ComposerModel.getMultipleById(
                    payload.performerInstance.payloadNeedUpdated,
                );
                if (existComposer.length === 0)
                    return {
                        status: 400,
                        success: false,
                        message: 'PERFORMER_HAS_ID_COMPOSER_NOT_FOUND',
                    };
                switch (payload.performerInstance.typeAction) {
                    case EnumActionUpdate.PUSH:
                        const allowInRecordSongPush =
                            currentSong.performers?.every(
                                (record) =>
                                    payload.performerInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) === -1,
                            );
                        if (allowInRecordSongPush)
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.performerInstance.typeAction.toUpperCase()}_ID_COMPOSER_ALREADY_EXIST`,
                            };
                        break;
                    case EnumActionUpdate.REMOVE:
                        const allowInRecordSongRemove =
                            currentSong.performers?.every(
                                (record) =>
                                    payload.performerInstance.payloadNeedUpdated.indexOf(
                                        record,
                                    ) !== -1,
                            );
                        if (allowInRecordSongRemove)
                            return {
                                status: 400,
                                success: false,
                                message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_COMPOSER_NOT_YET_ALREADY_EXIST`,
                            };
                        break;
                    default:
                        break;
                }
            }
            if (payload.thumbnail) {
                const idThumbnail =
                    currentSong.thumbnail?.split('thumbnail/')[1];
                const currentThumbnail = await ThumbnailModel.getById(
                    idThumbnail as string,
                );
                if (!currentThumbnail)
                    throw new Error('THUMBNAIL_IS_NOT_EXIST');
                const pathThumbnailToDelete = path.join(
                    __dirname,
                    '../..',
                    currentThumbnail.path,
                );
                await ThumbnailRepository.forceDelete(pathThumbnailToDelete);
                await ThumbnailModel.update(currentThumbnail._id as string, {
                    path: payload.thumbnail.path.split('harmony-server/')[1],
                });
            }
            if (payload.fileSong) {
                const currentFileSong = await SongPathModel.getById(
                    currentSong.songPathReference as string,
                );
                if (!currentFileSong) throw new Error('FILE_SONG_IS_NOT_EXIST');
                const pathFileSongToDelete = path.join(
                    __dirname,
                    '../..',
                    currentFileSong.path,
                );
                await SongRepository.forceDelete(pathFileSongToDelete);

                const informationFileSong =
                    await SongRepository.getInformationFileSong(
                        payload.fileSong,
                    );
                await SongPathModel.update(currentFileSong._id as string, {
                    path: payload.fileSong.path.split('harmony-server/')[1],
                    size: informationFileSong.format.size,
                    duration: informationFileSong.format.duration,
                });
            }
            if (conditionGenreUpdate) {
                await GenreModel.updateManyActionSongReference(
                    payload.genreInstance.payloadNeedUpdated,
                    currentSong._id,
                    payload.genreInstance.typeAction,
                );
                await SongModel.updateByAction(
                    id,
                    {
                        genresReference:
                            payload.genreInstance.payloadNeedUpdated,
                    },
                    payload.genreInstance.typeAction,
                );
            }
            if (conditionAlbumUpdate) {
                await AlbumModel.updateManyActionSongReference(
                    payload.albumInstance.payloadNeedUpdated,
                    currentSong._id,
                    payload.albumInstance.typeAction,
                );
                await SongModel.updateByAction(
                    id,
                    {
                        albumReference:
                            payload.albumInstance.payloadNeedUpdated,
                    },
                    payload.albumInstance.typeAction,
                );
            }
            if (conditionPerformerUpdate) {
                await SongModel.updateByAction(
                    id,
                    {
                        performers:
                            payload.performerInstance.payloadNeedUpdated,
                    },
                    payload.performerInstance.typeAction,
                );
            }
            await SongModel.updateFieldPrimateType(id, {
                title: payload.title,
                publish: payload.publish,
            });
            return {
                status: 200,
                success: true,
                message: 'UPDATE_SONG_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            if (payload.thumbnail) {
                await ThumbnailRepository.forceDelete(payload.thumbnail.path);
            }
            if (payload.fileSong) {
                await SongRepository.forceDelete(payload.fileSong.path);
            }
            return {
                status: 500,
                success: false,
                message: 'UPDATE_SONG_FAILED',
                errors: error,
            };
        }
    }
    public static async forceDelete(id: string): Promise<CustomResponse> {
        try {

            const song = await SongModel.getById(id);

            if (song) {
                const thumbnail = song.thumbnail
                const songPath = song.songPathReference

                if (thumbnail) {
                    const parts = thumbnail.split('/');
                    const result = parts[parts.length - 1];
                    console.log(result);
                    await ThumbnailModel.forceDelete(result);
                } else {
                    return {
                        status: 400,
                        success: false,
                        message: 'THUMBNAIL_ID_EXIXTS'
                    }
                }

                if (songPath) {
                    await SongPathModel.forceDelete(songPath);
                } else {
                    return {
                        status: 400,
                        success: false,
                        message: 'SONGPATH_ID_EXIXTS'
                    }
                }

                await SongModel.forceDelete(song._id);
                return {
                    status: 201,
                    success: true,
                    message: 'DELETE_SONG_SUCCESSFULLY'
                }
            } else {
                return {
                    status: 400,
                    success: false,
                    message: 'PERFORMER_HAS_ID_COMPOSER_NOT_FOUND',
                }

            }

        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'DELETE_SONG_FAILED'
            }
        }
    }
}
