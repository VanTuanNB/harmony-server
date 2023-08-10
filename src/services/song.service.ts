import { config } from 'dotenv';
config();

import { v4 as uuidv4 } from 'uuid';
import { ISong } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import SongFilter from '@/filters/song.filter';
import ValidatePayload from '@/helpers/validate.helper';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { GetObjectOutput } from '@aws-sdk/client-s3';
import {
    albumModel,
    albumService,
    favoriteModel,
    genreModel,
    genreService,
    historyModel,
    playlistModel,
    s3Service,
    songDraftModel,
    songModel,
    userModel,
} from '@/instances/index.instance';

export interface ITypeFiles {
    thumbnail: Express.Multer.File;
    fileSong: Express.Multer.File;
}

export interface IFsStreamSong {
    instanceContent: GetObjectOutput;
    resHeader: {
        [type: string]: string | number;
    };
}

export default class SongService {
    constructor() {}
    public async getAll(): Promise<CustomResponse<ISong[] | []>> {
        try {
            const songs = await songModel.getAll();
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

    public async getById(_id: string): Promise<CustomResponse<ISong | null>> {
        try {
            const song = await songModel.getById(_id);
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

    public async create(
        payload: Pick<
            ISong,
            | 'title'
            | 'publish'
            | 'genresReference'
            | 'albumReference'
            | 'performers'
            | 'userReference'
        > & { uploadId: string },
    ): Promise<CustomResponse> {
        try {
            const currentSongDraft = await songDraftModel.getById(
                payload.uploadId,
            );
            const isFailedCheckFirst =
                !currentSongDraft || payload.uploadId !== currentSongDraft._id;
            if (isFailedCheckFirst)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD_SONG',
                };

            const isFailedCheckSecond =
                !currentSongDraft.audio && currentSongDraft.thumbnail === null;
            if (isFailedCheckSecond)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD_SONG',
                };
            const _id = uuidv4();
            const songFilter = new SongFilter({
                _id,
                thumbnailUrl: `${process.env.SERVER_URL}:${process.env.PORT_SERVER}/api/v1/thumbnail/${_id}`,
                thumbnail: {
                    bucketName: currentSongDraft.thumbnail!.bucketName,
                    keyObject: currentSongDraft.thumbnail!.keyObject,
                    contentType: currentSongDraft.thumbnail!.contentType,
                },
                audio: {
                    bucketName: currentSongDraft.audio.bucketName,
                    keyObject: currentSongDraft.audio.keyObject,
                    contentType: currentSongDraft.audio.contentType,
                },
                genresReference: payload.genresReference,
                albumReference: payload.albumReference,
                performers: payload.performers,
                publish: payload.publish,
                title: payload.title,
                userReference: payload.userReference,
            });
            const songInValid = await ValidatePayload(
                songFilter,
                'BAD_REQUEST',
                true,
            );
            if (songInValid) return songInValid;
            const create = await songModel.create(songFilter);
            if (!create) throw new Error('POST_SONG_FAILED');
            await genreModel.updateManyActionSongReference(
                songFilter.genresReference,
                songFilter._id,
                EnumActionUpdate.PUSH,
            );
            await userModel.updateIncreaseSongReferenceById(
                currentSongDraft.userReference,
                songFilter._id,
            );
            if (songFilter.albumReference && songFilter.albumReference.length) {
                await albumModel.updateManyActionSongReference(
                    songFilter.albumReference,
                    songFilter._id,
                    EnumActionUpdate.PUSH,
                );
            }
            const removeSongDraft = await songDraftModel.forceDelete(
                currentSongDraft._id,
            );
            if (!removeSongDraft) throw new Error('POST_SONG_FAILED');
            return {
                status: 201,
                success: true,
                message: 'POST_SONG_SUCCESSFULLY',
                data: create,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_SONG_FAILED',
                errors: error,
            };
        }
    }

    public async update(
        _id: string,
        payload: Pick<
            ISong,
            | 'albumReference'
            | 'genresReference'
            | 'performers'
            | 'publish'
            | 'title'
        >,
    ): Promise<CustomResponse<ISong>> {
        try {
            const update = await songModel.updateField(_id, payload);
            if (!update)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            if (payload.albumReference)
                albumService.updateBySongEventUpdate(
                    payload.albumReference,
                    _id,
                );
            if (payload.genresReference)
                genreService.updateBySongEventUpdate(
                    payload.genresReference,
                    _id,
                );
            return {
                status: 200,
                success: true,
                message: 'PUT_SONG_SUCCESSFULLY',
                data: update,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'PUT_SONG_FAILED',
                errors: error,
            };
        }
    }

    public async forceDelete(
        _id: string,
        userId: string,
    ): Promise<CustomResponse<ISong>> {
        try {
            const responseCurrentSong = await this.getById(_id);
            if (!responseCurrentSong.data)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const checkIsUserPermission = (
                responseCurrentSong.data.userReference as any
            )._id;
            if (checkIsUserPermission !== userId)
                return {
                    status: 403,
                    success: false,
                    message: 'FORBIDDEN',
                };
            const deleteFileS3Response = await s3Service.deleteFileOnS3(
                responseCurrentSong.data.audio,
            );
            // thiếu 1 phần delete thumbnail
            if (!deleteFileS3Response.success) return deleteFileS3Response;
            const deleteSong = await songModel.forceDelete(_id);
            if (!deleteSong)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            await albumModel.updateDetachListSong(responseCurrentSong.data._id);
            await favoriteModel.updateDetachListSong(
                responseCurrentSong.data._id,
            );
            await genreModel.updateDetachListSong(responseCurrentSong.data._id);
            await historyModel.updateDetachListSong(
                responseCurrentSong.data._id,
            );
            await userModel.updateDetachListSong(responseCurrentSong.data._id);
            await playlistModel.updateDetachListSong(
                responseCurrentSong.data._id,
            );
            return {
                status: 200,
                success: true,
                message: 'FORCE_DELETE_SUCCESSFULLY',
                data: deleteSong,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'DELETE_SONG_FAILED',
                errors: error,
            };
        }
    }

    public async getStreamSong(
        _id: string,
        range: string | undefined,
    ): Promise<CustomResponse<IFsStreamSong>> {
        try {
            const currentSong = await songModel.getByIdNoPopulate(_id);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_STREAM_SONG_NOT_EXIST',
                };
            if (range) {
                const fileContent = await s3Service.getFileContentS3({
                    bucketName: currentSong.audio.bucketName,
                    contentType: currentSong.audio.contentType,
                    keyObject: currentSong.audio.keyObject,
                    range,
                });
                return {
                    status: 206,
                    success: true,
                    message: 'GET_FS_STREAM_SONG_SUCCESSFULLY',
                    data: {
                        instanceContent: fileContent.data as GetObjectOutput,
                        resHeader: {
                            'Accept-Ranges': 'bytes',
                            'Content-Range': fileContent.data
                                ? fileContent.data.ContentRange || '0-0/0'
                                : '0-0/0',
                            'Content-Length':
                                (fileContent.data &&
                                    fileContent.data.ContentLength) ||
                                0,
                            'Content-Type': currentSong.audio.contentType,
                        },
                    },
                };
            } else {
                const fileContent = await s3Service.getFileContentS3({
                    bucketName: currentSong.audio.bucketName,
                    contentType: currentSong.audio.contentType,
                    keyObject: currentSong.audio.keyObject,
                });
                return {
                    status: 200,
                    success: true,
                    message: 'GET_FS_STREAM_SONG_SUCCESSFULLY',
                    data: {
                        instanceContent: fileContent.data as GetObjectOutput,
                        resHeader: {
                            'Accept-Ranges': 'bytes',
                            'Content-Length':
                                (fileContent.data &&
                                    fileContent.data.ContentLength) ||
                                0,
                            'Content-Type': currentSong.audio.contentType,
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

    public async updateByAlbumEventUpdate(
        listSongId: string[],
        albumId: string,
    ): Promise<CustomResponse> {
        try {
            const listSongByAlbumId =
                await songModel.getMultipleByAlbumReference(
                    listSongId,
                    albumId,
                );
            const mapping = listSongByAlbumId.map((song) => song._id);
            const filterIdNotPercent = listSongId.filter(
                (songId) => mapping.indexOf(songId) === -1,
            );
            if (filterIdNotPercent.length) {
                await songModel.updateByAction(
                    filterIdNotPercent,
                    {
                        albumReference: [albumId],
                    },
                    EnumActionUpdate.PUSH,
                );
            } else {
                const listAllById = (
                    await songModel.getListByAlbumReference(albumId)
                ).map((song) => song._id);
                const listPullListSong = listAllById.filter(
                    (songId) => listSongId.indexOf(songId) === -1,
                );
                if (listPullListSong.length)
                    await songModel.updateByAction(
                        listPullListSong,
                        {
                            albumReference: [albumId],
                        },
                        EnumActionUpdate.REMOVE,
                    );
            }

            return {
                status: 200,
                success: true,
                message: 'UPDATE_ALBUM_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_LITS_SONG_BY_ALBUM_ID_FAILED',
                errors: error,
            };
        }
    }
}
