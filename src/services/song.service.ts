import { config } from 'dotenv';
config();


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

export interface ITypeFiles {
    thumbnail: Express.Multer.File;
    fileSong: Express.Multer.File;
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
    public static async getById(_id: string): Promise<CustomResponse<ISong | null>> {
        try {
            const song = await SongModel.getbyId(_id);
            if(!song) return{
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
            }
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
}
