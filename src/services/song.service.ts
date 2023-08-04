import { config } from 'dotenv';
config();
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid';
import { ISong } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import SongFilter from '@/filters/song.filter';
import ValidatePayload from '@/helpers/validate.helper';
import SongModel from '@/models/song.model';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import GenreModel from '@/models/genre.model';
import AlbumModel from '@/models/album.model';
import songDraftModel from '@/models/songDraft.model';
import S3Service from './s3.service';
import FavoriteModel from '@/models/favorite.model';
import HistoryModel from '@/models/history.model';
import UserModel from '@/models/user.model';
import PlaylistModel from '@/models/paylist.model';
import { GetObjectOutput } from '@aws-sdk/client-s3';

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
    constructor(
        private s3Service: S3Service, // private songModel: SongModel
    ) {}
    public async getAll(): Promise<CustomResponse<ISong[] | []>> {
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

    public async getById(_id: string): Promise<CustomResponse<ISong | null>> {
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
            const create = await SongModel.create(songFilter);
            if (!create) throw new Error('POST_SONG_FAILED');
            await GenreModel.updateManyActionSongReference(
                songFilter.genresReference,
                songFilter._id,
                EnumActionUpdate.PUSH,
            );
            if (songFilter.albumReference && songFilter.albumReference.length) {
                await AlbumModel.updateManyActionSongReference(
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
            const update = await SongModel.updateField(_id, payload);
            if (!update)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
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
            const deleteFileS3Response = await this.s3Service.deleteFileOnS3(
                responseCurrentSong.data.audio,
            );
            // thiếu 1 phần delete thumbnail
            if (!deleteFileS3Response.success) return deleteFileS3Response;
            const deleteSong = await SongModel.forceDelete(_id);
            if (!deleteSong)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            await AlbumModel.updateDetachListSong(responseCurrentSong.data._id);
            await FavoriteModel.updateDetachListSong(
                responseCurrentSong.data._id,
            );
            await GenreModel.updateDetachListSong(responseCurrentSong.data._id);
            await HistoryModel.updateDetachListSong(
                responseCurrentSong.data._id,
            );
            await UserModel.updateDetachListSong(responseCurrentSong.data._id);
            await PlaylistModel.updateDetachListSong(
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
            const currentSong = await SongModel.getByIdNoPopulate(_id);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_STREAM_SONG_NOT_EXIST',
                };
            if (range) {
                const fileContent = await this.s3Service.getFileContentS3({
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
                const fileContent = await this.s3Service.getFileContentS3({
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

    // public static async validateTitleUploadSong(
    //     title: string,
    //     userReference: string,
    //     files: ITypeFiles,
    // ): Promise<CustomResponse> {
    //     try {
    //         const composer = await ComposerService.getById(userReference);
    //         if (!composer) {
    //             handleDeleteFile(files.fileSong);
    //             handleDeleteFile(files.thumbnail);
    //             return {
    //                 status: 400,
    //                 success: false,
    //                 message: 'COMPOSER_NOT_EXIST',
    //             };
    //         }
    //         const listSongOfComposer = await ComposerService.getListSongById(
    //             userReference,
    //         );
    //         const songs = listSongOfComposer.data!.songsReference as any[];
    //         const isDuplicated = songs.some(
    //             (song: ISong) =>
    //                 song.title.toLowerCase() === title.toLowerCase(),
    //         );
    //         if (isDuplicated) {
    //             handleDeleteFile(files.fileSong);
    //             handleDeleteFile(files.thumbnail);
    //             return {
    //                 status: 400,
    //                 success: false,
    //                 message: 'BAD_REQUEST_DUPLICATED_TITLE',
    //             };
    //         }
    //         return {
    //             status: 200,
    //             success: true,
    //             message: 'TRANSFER_NEXT_FUNCTION',
    //         };
    //     } catch (error) {
    //         console.log(error);
    //         handleDeleteFile(files.fileSong);
    //         handleDeleteFile(files.thumbnail);
    //         return {
    //             status: 500,
    //             success: false,
    //             message: 'UPLOAD_SONG_FAILED',
    //             errors: error,
    //         };
    //     }
    // }

    // public static async create(
    //     files: ITypeFiles,
    //     payload: Omit<
    //         ISong,
    //         | '_id'
    //         | 'duration'
    //         | 'thumbnail'
    //         | 'createdAt'
    //         | 'updatedAt'
    //         | 'songPathId'
    //     >,
    // ): Promise<CustomResponse> {
    //     try {
    //         Object.assign(payload, {
    //             albumReference: payload.albumReference
    //                 ? JSON.parse(payload.albumReference as any)
    //                 : undefined,
    //             genresReference: JSON.parse(payload.genresReference as any),
    //             performers: JSON.parse(payload.performers as any),
    //         });
    //         const fileSongInfo = await SongRepository.getInformationFileSong(
    //             files.fileSong,
    //         );
    //         const _id = uuidv4();
    //         const songFilter = new SongFilter({
    //             ...payload,
    //             _id,
    //         });

    //         const songInValid = await ValidatePayload(
    //             songFilter,
    //             'BAD_REQUEST',
    //             true,
    //         );
    //         if (songInValid) return songInValid;
    //         const createThumbnail = await ThumbnailModel.create({
    //             _id: uuidv4(),
    //             path: pathFromSystem(files.thumbnail.path, process.platform),
    //         });
    //         const createSongPath = await SongPathModel.create({
    //             _id: uuidv4(),
    //             path: pathFromSystem(files.fileSong.path, process.platform),
    //             size: fileSongInfo.format.size as number,
    //             duration: fileSongInfo.format.duration as number,
    //             type: files.fileSong.mimetype,
    //         });
    //         Object.assign(songFilter, {
    //             thumbnail: `${process.env.SERVER_URL}:${process.env.PORT_SERVER}/api/v1/thumbnail/${createThumbnail._id}`,
    //             songPathReference: createSongPath._id,
    //         });

    //         const createdSong = await SongModel.create(songFilter);
    //         const injectorComposer = await ComposerModel.updatedField(
    //             payload.userReference,
    //             { songsReference: createdSong._id },
    //         );
    //         const injectorGenre = await GenreService.updateMultipleCollection(
    //             payload.genresReference as string[],
    //             createdSong._id,
    //         );
    //         if (!!payload.albumReference) {
    //             await AlbumService.updateMultipleCollection(
    //                 payload.albumReference as string[],
    //                 createdSong._id,
    //             );
    //         }
    //         if (!injectorComposer || !injectorGenre) {
    //             await ThumbnailModel.forceDelete(createThumbnail._id);
    //             await SongPathModel.forceDelete(createSongPath._id);
    //             await SongModel.forceDelete(createdSong._id);
    //             return {
    //                 status: 400,
    //                 success: false,
    //                 message: 'BAD_REQUEST_NOT_EXIST_COMPOSER',
    //             };
    //         }
    //         return {
    //             status: 201,
    //             success: true,
    //             message: 'POST_SONG_SUCCESSFULLY',
    //             data: createdSong,
    //         };
    //     } catch (error) {
    //         console.log(error);
    //         handleDeleteFile(files.fileSong);
    //         handleDeleteFile(files.thumbnail);
    //         return {
    //             status: 500,
    //             success: false,
    //             message: 'POST_SONG_FAILED',
    //             errors: error,
    //         };
    //     }
    // }

    // public static async update(
    //     id: string,
    //     payload: IPayloadUpdate,
    // ): Promise<CustomResponse> {
    //     try {
    //         Object.assign(payload, {
    //             genreInstance: payload.genreInstance
    //                 ? JSON.parse(payload.genreInstance as any)
    //                 : undefined,
    //             albumInstance: payload.albumInstance
    //                 ? JSON.parse(payload.albumInstance as any)
    //                 : undefined,
    //             performerInstance: payload.performerInstance
    //                 ? JSON.parse(payload.performerInstance as any)
    //                 : undefined,
    //         });
    //         const currentSong = await SongModel.getByIdNoPopulate(id);
    //         if (!currentSong)
    //             return {
    //                 status: 400,
    //                 success: false,
    //                 message: 'ID_SONG_NOT_EXIST',
    //             };
    //         const conditionGenreUpdate =
    //             payload.genreInstance &&
    //             payload.genreInstance.typeAction !== EnumActionUpdate.NOTHING &&
    //             payload.genreInstance.payloadNeedUpdated.length > 0;
    //         const conditionAlbumUpdate =
    //             payload.albumInstance &&
    //             payload.albumInstance.typeAction !== EnumActionUpdate.NOTHING &&
    //             payload.albumInstance.payloadNeedUpdated.length > 0;
    //         const conditionPerformerUpdate =
    //             payload.performerInstance &&
    //             payload.performerInstance.typeAction !==
    //                 EnumActionUpdate.NOTHING &&
    //             payload.performerInstance.payloadNeedUpdated.length > 0;
    //         if (conditionGenreUpdate) {
    //             const multipleRecordGenres =
    //                 await GenreModel.getMultipleBySongReference(
    //                     payload.genreInstance.payloadNeedUpdated,
    //                     id,
    //                 );
    //             switch (payload.genreInstance.typeAction) {
    //                 case EnumActionUpdate.PUSH:
    //                     const allowInRecordSongPush =
    //                         currentSong.genresReference?.every(
    //                             (record: any) =>
    //                                 payload.genreInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) !== -1,
    //                         );
    //                     if (
    //                         multipleRecordGenres.length > 0 &&
    //                         allowInRecordSongPush
    //                     )
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.genreInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 case EnumActionUpdate.REMOVE:
    //                     const allowInRecordSongRemove =
    //                         currentSong.genresReference?.every(
    //                             (record: any) =>
    //                                 payload.genreInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) === -1,
    //                         );
    //                     if (
    //                         multipleRecordGenres.length === 0 &&
    //                         allowInRecordSongRemove
    //                     )
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.genreInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_NOT_YET_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }
    //         if (conditionAlbumUpdate) {
    //             const multipleRecordGenres =
    //                 await AlbumModel.getMultipleBySongReference(
    //                     payload.albumInstance.payloadNeedUpdated,
    //                     id,
    //                 );
    //             switch (payload.albumInstance.typeAction) {
    //                 case EnumActionUpdate.PUSH:
    //                     const allowInRecordSongPush =
    //                         currentSong.albumReference?.every(
    //                             (record: any) =>
    //                                 payload.albumInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) === -1,
    //                         );
    //                     if (
    //                         multipleRecordGenres.length > 0 &&
    //                         allowInRecordSongPush
    //                     )
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 case EnumActionUpdate.REMOVE:
    //                     const allowInRecordSongRemove =
    //                         currentSong.albumReference?.every(
    //                             (record: any) =>
    //                                 payload.albumInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) !== -1,
    //                         );
    //                     if (
    //                         multipleRecordGenres.length === 0 &&
    //                         allowInRecordSongRemove
    //                     )
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_SONG_REFERENCE_NOT_YET_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }
    //         if (conditionPerformerUpdate) {
    //             const existComposer = await ComposerModel.getMultipleById(
    //                 payload.performerInstance.payloadNeedUpdated,
    //             );
    //             if (existComposer.length === 0)
    //                 return {
    //                     status: 400,
    //                     success: false,
    //                     message: 'PERFORMER_HAS_ID_COMPOSER_NOT_FOUND',
    //                 };
    //             switch (payload.performerInstance.typeAction) {
    //                 case EnumActionUpdate.PUSH:
    //                     const allowInRecordSongPush =
    //                         currentSong.performers?.every(
    //                             (record: any) =>
    //                                 payload.performerInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) === -1,
    //                         );
    //                     if (allowInRecordSongPush)
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.performerInstance.typeAction.toUpperCase()}_ID_COMPOSER_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 case EnumActionUpdate.REMOVE:
    //                     const allowInRecordSongRemove =
    //                         currentSong.performers?.every(
    //                             (record: any) =>
    //                                 payload.performerInstance.payloadNeedUpdated.indexOf(
    //                                     record,
    //                                 ) !== -1,
    //                         );
    //                     if (allowInRecordSongRemove)
    //                         return {
    //                             status: 400,
    //                             success: false,
    //                             message: `ACTION_${payload.albumInstance.typeAction.toUpperCase()}_ID_COMPOSER_NOT_YET_ALREADY_EXIST`,
    //                         };
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }
    //         if (payload.thumbnail) {
    //             const idThumbnail =
    //                 currentSong.thumbnail?.split('thumbnail/')[1];
    //             const currentThumbnail = await ThumbnailModel.getById(
    //                 idThumbnail as string,
    //             );
    //             if (!currentThumbnail)
    //                 throw new Error('THUMBNAIL_IS_NOT_EXIST');
    //             const pathThumbnailToDelete = path.join(
    //                 __dirname,
    //                 '../..',
    //                 currentThumbnail.path,
    //             );
    //             await ThumbnailRepository.forceDelete(pathThumbnailToDelete);
    //             await ThumbnailModel.update(currentThumbnail._id as string, {
    //                 path: payload.thumbnail.path.split('harmony-server/')[1],
    //             });
    //         }
    //         if (payload.fileSong) {
    //             const currentFileSong = await SongPathModel.getById(
    //                 currentSong.songPathReference as string,
    //             );
    //             if (!currentFileSong) throw new Error('FILE_SONG_IS_NOT_EXIST');
    //             const pathFileSongToDelete = path.join(
    //                 __dirname,
    //                 '../..',
    //                 currentFileSong.path,
    //             );
    //             await SongRepository.forceDelete(pathFileSongToDelete);

    //             const informationFileSong =
    //                 await SongRepository.getInformationFileSong(
    //                     payload.fileSong,
    //                 );
    //             await SongPathModel.update(currentFileSong._id as string, {
    //                 path: payload.fileSong.path.split('harmony-server/')[1],
    //                 size: informationFileSong.format.size,
    //                 duration: informationFileSong.format.duration,
    //             });
    //         }
    //         if (conditionGenreUpdate) {
    //             await GenreModel.updateManyActionSongReference(
    //                 payload.genreInstance.payloadNeedUpdated,
    //                 currentSong._id,
    //                 payload.genreInstance.typeAction,
    //             );
    //             await SongModel.updateByAction(
    //                 id,
    //                 {
    //                     genresReference:
    //                         payload.genreInstance.payloadNeedUpdated,
    //                 },
    //                 payload.genreInstance.typeAction,
    //             );
    //         }
    //         if (conditionAlbumUpdate) {
    //             await AlbumModel.updateManyActionSongReference(
    //                 payload.albumInstance.payloadNeedUpdated,
    //                 currentSong._id,
    //                 payload.albumInstance.typeAction,
    //             );
    //             await SongModel.updateByAction(
    //                 id,
    //                 {
    //                     albumReference:
    //                         payload.albumInstance.payloadNeedUpdated,
    //                 },
    //                 payload.albumInstance.typeAction,
    //             );
    //         }
    //         if (conditionPerformerUpdate) {
    //             await SongModel.updateByAction(
    //                 id,
    //                 {
    //                     performers:
    //                         payload.performerInstance.payloadNeedUpdated,
    //                 },
    //                 payload.performerInstance.typeAction,
    //             );
    //         }
    //         await SongModel.updateFieldPrimateType(id, {
    //             title: payload.title,
    //             publish: payload.publish,
    //         });
    //         return {
    //             status: 200,
    //             success: true,
    //             message: 'UPDATE_SONG_SUCCESSFULLY',
    //         };
    //     } catch (error) {
    //         console.log(error);
    //         if (payload.thumbnail) {
    //             await ThumbnailRepository.forceDelete(payload.thumbnail.path);
    //         }
    //         if (payload.fileSong) {
    //             await SongRepository.forceDelete(payload.fileSong.path);
    //         }
    //         return {
    //             status: 500,
    //             success: false,
    //             message: 'UPDATE_SONG_FAILED',
    //             errors: error,
    //         };
    //     }
    // }
    // public static async forceDelete(id: string): Promise<CustomResponse> {
    //     try {
    //         const song = await SongModel.getById(id);

    //         if (song) {
    //             const thumbnail = song.thumbnail;
    //             const songPath = song.songPathReference;

    //             if (thumbnail) {
    //                 const parts = thumbnail.split('/');
    //                 const result = parts[parts.length - 1];
    //                 console.log(result);
    //                 await ThumbnailModel.forceDelete(result);
    //             } else {
    //                 return {
    //                     status: 400,
    //                     success: false,
    //                     message: 'THUMBNAIL_ID_EXIXTS',
    //                 };
    //             }

    //             if (songPath) {
    //                 await SongPathModel.forceDelete(songPath);
    //             } else {
    //                 return {
    //                     status: 400,
    //                     success: false,
    //                     message: 'SONGPATH_ID_EXIXTS',
    //                 };
    //             }

    //             await SongModel.forceDelete(song._id);
    //             return {
    //                 status: 201,
    //                 success: true,
    //                 message: 'DELETE_SONG_SUCCESSFULLY',
    //             };
    //         } else {
    //             return {
    //                 status: 400,
    //                 success: false,
    //                 message: 'PERFORMER_HAS_ID_COMPOSER_NOT_FOUND',
    //             };
    //         }
    //     } catch (error) {
    //         return {
    //             status: 500,
    //             success: false,
    //             message: 'DELETE_SONG_FAILED',
    //         };
    //     }
    // }
}
