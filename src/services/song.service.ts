import { GetObjectOutput } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
config();

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { ISong } from '@/constraints/interfaces/index.interface';
import SongFilter from '@/filters/song.filter';
import ValidatePayload from '@/helpers/validate.helper';
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
import TaskQueue from '@/queues/index.queue';

export interface IFsStreamSong {
    instanceContent: GetObjectOutput;
    resHeader: {
        [type: string]: string | number;
    };
}

export default class SongService {
    private taskQueue: TaskQueue;
    constructor() {
        this.taskQueue = new TaskQueue(10);
    }
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

    public async getJustReleased(item: number): Promise<CustomResponse<ISong[] | []>> {
        try {
            const songs = await songModel.getSongJustReleasedPopulate(item);
            const getall = await songModel.getAll()
            if (item == 0 || item > getall.length) return {
                status: 400,
                success: false,
                message: 'LIST_SONG_QUERY_PARMAS_NOT_EXITS',
            }

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
                message: 'GET_SONG_JUST_RELEASED_FAILED',
                errors: error,
            };
        }
    }

    public async getTopView(item: number): Promise<CustomResponse<ISong[] | []>> {
        try {
            const songs = await songModel.getSongTopView(item);
            if (item === 0) return {
                status: 400,
                success: false,
                message: 'SONG_LENGTH_NOT_EXIST',
            };
            return {
                status: 200,
                success: true,
                message: 'GET_SONG_TOP_SUCCESSFULLY',
                data: songs,
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_SONG_TOP_FAILED',
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

    public async search(
        title: string,
    ): Promise<CustomResponse<ISong | {}>> {
        try {
            const song = await songModel.search(title);
            const album = await albumModel.search(title)
            const performers = await userModel.search(title)
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
                performers: performers,
            }

            return {
                status: 200,
                success: true,
                message: 'GET_SONG_AND_ALBUM_SEARCH_SUCCESSFULLY',
                data: data,
            }
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'GET_SONG_AND_ALBUM_FAILED',
                errors: error,
            };
        }
    }

    public async suggest(
        page: number,
        size: number,
    ): Promise<CustomResponse<ISong[]>> {
        try {
            page = page === 0 ? 1 : page;
            size = size === 0 ? 10 : size;
            const songs = await songModel.getAll();
            const skip = size * (page - 1);
            const totalPages = Math.ceil(songs.length / size);
            const currentPage = songs.splice(skip, size);
            return {
                status: 200,
                success: true,
                message: 'GET_SUGGEST_SONGS_SUCCESSFULLY',
                data: currentPage,
                paging: {
                    page,
                    size,
                    totalItems: currentPage.length || 0,
                    totalPages,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_SUGGEST_SONGS_FAILED',
                errors: error,
            }
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
        > & {
            isNewUploadAvatar?: boolean;
            contentType?:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG;
        },
    ): Promise<CustomResponse> {
        try {
            if (payload.isNewUploadAvatar && !payload.contentType)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const updateInformation = await songModel.updateField(_id, payload);
            if (!updateInformation)
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
            let updateThumbnail = undefined;
            if (payload.isNewUploadAvatar && payload.contentType) {
                updateThumbnail =
                    await s3Service.getSignUrlForUploadThumbnailSong(
                        _id,
                        payload.contentType,
                    );
                if (!updateThumbnail.success) return updateThumbnail;
            }
            return {
                status: 200,
                success: true,
                message: 'PUT_SONG_SUCCESSFULLY',
                data: !!updateThumbnail ? updateThumbnail : updateInformation,
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
                message: 'UPDATE_LITS_SONG_BY_ALBUM_ID_SUCCESSFULLY',
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

    public async updateByGenreEventUpdate(
        listSongId: string[],
        genreId: string,
    ): Promise<CustomResponse> {
        try {
            const listSongByGenreId =
                await songModel.getMultipleByGenreReference(
                    listSongId,
                    genreId,
                );
            const mapping = listSongByGenreId.map((song) => song._id);
            const filterIdNotPercent = listSongId.filter(
                (songId) => mapping.indexOf(songId) === -1,
            );
            if (filterIdNotPercent.length) {
                await songModel.updateByAction(
                    filterIdNotPercent,
                    {
                        genresReference: [genreId],
                    },
                    EnumActionUpdate.PUSH,
                );
            } else {
                const listAllById = (
                    await songModel.getListByGenreReference(genreId)
                ).map((song) => song._id);
                const listPullListSong = listAllById.filter(
                    (songId) => listSongId.indexOf(songId) === -1,
                );
                if (listPullListSong.length)
                    await songModel.updateByAction(
                        listPullListSong,
                        {
                            genresReference: [genreId],
                        },
                        EnumActionUpdate.REMOVE,
                    );
            }
            return {
                status: 200,
                success: true,
                message: 'UPDATE_LITS_SONG_BY_GENRE_ID_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_LITS_SONG_BY_GENRE_ID_FAILED',
                errors: error,
            };
        }
    }

    public async increaseViewQueue(_id: string): Promise<CustomResponse> {
        try {
            await this.taskQueue.add(async () => {
                const increase = await songModel.increaseView(_id);
                if (!increase) throw new Error('BAD_REQUEST');
            });
            return {
                status: 200,
                success: true,
                message: 'UPDATE_VIEW_SONG_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_VIEW_SONG_FAILED',
                errors: error,
            };
        }
    }
}
