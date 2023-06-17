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
    extends Partial<
            Omit<
                ISong,
                '_id' | 'thumbnail' | 'composerReference' | 'songPathReference'
            >
        >,
        Partial<ITypeFiles> {}

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

    public static async getFsStreamSong(
        idSongPath: string,
        range: string | undefined,
    ): Promise<CustomResponse<IFsStreamSong>> {
        try {
            const filePath = await SongPathModel.getById(idSongPath);
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
                duration: fileSongInfo.format.duration as number,
            });
            const songInValid = await ValidatePayload(
                songFilter,
                'BAD_REQUEST',
                true,
            );
            if (songInValid) return songInValid;
            const createThumbnail = await ThumbnailModel.create({
                _id: uuidv4(),
                path: files.thumbnail.path.split('harmony-server/')[1],
            });
            const createSongPath = await SongPathModel.create({
                _id: uuidv4(),
                path: files.fileSong.path.split('harmony-server/')[1],
                size: fileSongInfo.format.size as number,
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
                albumReference: payload.albumReference
                    ? JSON.parse(payload.genresReference as any)
                    : undefined,
                genresReference: payload.genresReference
                    ? JSON.parse(payload.genresReference as any)
                    : undefined,
                performers: payload.performers
                    ? JSON.parse(payload.performers as any)
                    : undefined,
            });
            if (
                Array.isArray(payload.performers) &&
                payload.performers.length === 0
            )
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_EMPTY_PERFORMERS',
                };
            if (
                Array.isArray(payload.genresReference) &&
                payload.genresReference.length === 0
            )
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_EMPTY_GENRE',
                };
            if (
                Array.isArray(payload.albumReference) &&
                payload.albumReference.length === 0
            )
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_EMPTY_ALBUM',
                };
            const currentSong = await SongModel.getById(id);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'ID_SONG_NOT_EXIST',
                };
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
                await SongPathModel.update(currentFileSong._id as string, {
                    path: payload.fileSong.path.split('harmony-server/')[1],
                });
                const informationFileSong =
                    await SongRepository.getInformationFileSong(
                        payload.fileSong,
                    );
                const updatedInfoSong = await SongModel.update(
                    currentSong._id,
                    {
                        title: payload.title,
                        publish: payload.publish,
                        genresReference: payload.genresReference,
                        performers: payload.performers,
                        albumReference: payload.albumReference,
                        duration: informationFileSong.format.duration,
                    },
                );
                if (!updatedInfoSong)
                    throw new Error('updated song has file song failed');
            }
            const updatedInfoSong = await SongModel.update(currentSong._id, {
                title: payload.title,
                publish: payload.publish,
                genresReference: payload.genresReference,
                performers: payload.performers,
                albumReference: payload.albumReference,
            });
            if (!updatedInfoSong) throw new Error('update song failed!');
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
}
