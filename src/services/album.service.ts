import { v4 as uuidv4 } from 'uuid';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import AlbumFilter from '@/filters/album.filter';
import ValidatePayload from '@/helpers/validate.helper';
import {
    albumModel,
    s3Service,
    songModel,
    songService,
    userModel,
    userService,
} from '@/instances/index.instance';

export default class AlbumService {
    constructor() { }
    public async create(
        payload: Pick<
            IAlbum,
            'title' | 'publish' | 'userReference' | 'listSong' | 'information'
        >,
    ): Promise<CustomResponse> {
        try {
            const _id: string = uuidv4();
            const composer = await userService.getById(payload.userReference);
            if (!composer)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_COMPOSER_NOT_FOUND',
                };
            const albumByComposer = await albumModel.getByComposerAndTitle(
                payload.userReference,
                payload.title,
            );
            if (albumByComposer)
                return {
                    status: 400,
                    success: false,
                    message: 'TITLE_ALBUM_IS_EXISTING',
                };
            const albumFilter = new AlbumFilter({
                ...payload,
                _id,
                thumbnail: null,
                thumbnailUrl: null,
            });
            const isInValidValidator = await ValidatePayload(
                albumFilter,
                'BAD_REQUEST',
                true,
            );
            if (isInValidValidator) return isInValidValidator;
            const newAlbum = await albumModel.create(albumFilter);
            await userModel.updateIncreaseAlbum(
                payload.userReference,
                newAlbum._id,
            );
            await songModel.updateIncreaseAlbumReference(
                albumFilter.listSong,
                albumFilter._id,
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

    public async updateBySongEventUpdate(
        listAlbumId: string[],
        songId: string,
    ): Promise<CustomResponse> {
        try {
            const listAlbumBySongId =
                await albumModel.getMultipleBySongReference(
                    listAlbumId,
                    songId,
                );
            const mapping = listAlbumBySongId.map((album) => album._id);
            const filterIdNotPercent = listAlbumId.filter(
                (albumId) => mapping.indexOf(albumId) === -1,
            );
            if (filterIdNotPercent.length) {
                await albumModel.updateManyActionSongReference(
                    filterIdNotPercent,
                    songId,
                    EnumActionUpdate.PUSH,
                );
            } else {
                const listAllById = (
                    await albumModel.getListBySongId(songId)
                ).map((album) => album._id);
                const listPullListSong = listAllById.filter(
                    (albumId) => listAlbumId.indexOf(albumId) === -1,
                );
                if (listPullListSong.length)
                    await albumModel.updateManyActionSongReference(
                        listPullListSong,
                        songId,
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
                message: 'UPDATE_ALBUM_FAILED',
                errors: error,
            };
        }
    }

    public async updateMultipleCollection(
        listIdAlbum: string[],
        songId: string,
    ): Promise<boolean> {
        try {
            listIdAlbum.forEach(async (id: string) => {
                await albumModel.updatedField(id, {
                    listSong: [songId],
                });
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public async getAlbumNewWeek(item: number): Promise<CustomResponse> {
        try {
            const albumNew = await albumModel.getAlbumNewWeek(item);
            const getall = await albumModel.getAll()
            if (item === 0 || item > getall.length) return {
                status: 400,
                success: false,
                message: 'Album_LENGTH_NOT_EXIST',
            };
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

    public async getById(_id: string): Promise<CustomResponse<IAlbum | null>> {
        try {
            const album = await albumModel.getById(_id);
            if (!album)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_ALBUM_BY_ID_EXISTS',
                };

            return {
                status: 200,
                success: true,
                message: 'GET_ALBUM_BY_ID_SUCCESSFULLY',
                data: album,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ALBUM_BY_ID_FAILED',
            };
        }
    }

    public async update(
        _id: string,
        payload: Pick<
            IAlbum,
            'title' | 'publish' | 'information' | 'listSong'
        > & {
            isNewUploadThumbnail: boolean;
            userId: string;
            contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG;
        },
    ): Promise<CustomResponse> {
        try {
            if (payload.isNewUploadThumbnail && !payload.contentType)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const currentAlbum = await this.getById(_id);
            if (!currentAlbum.success) return currentAlbum;
            const updateAlbum = await albumModel.updatedField(_id, payload);
            if (!updateAlbum) throw new Error('CAN_NOT_UPDATE_ALBUM');
            if (payload.listSong) {
                await songService.updateByAlbumEventUpdate(
                    payload.listSong,
                    _id,
                );
            }
            let responseS3Data = undefined;
            if (payload.isNewUploadThumbnail) {
                const response = await s3Service.getSignUrlForUploadAlbum(
                    payload.userId,
                    _id,
                    payload.contentType,
                );
                if (!response.success) throw new Error('UPLOAD_THUMBNAIL_ALBUM');
                responseS3Data = response.data;

            }
            return {
                status: 200,
                success: true,
                message: 'UPDATE_ALBUM_SUCCESSFULLY',
                data: responseS3Data ? responseS3Data : updateAlbum,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_ALBUM_FAILED',
                errors: error,
            };
        }
    }

    public async getByIdPopulate(_id: string): Promise<CustomResponse<IAlbum | null>> {
        try {
            const album = await albumModel.getByIdPopulate(_id);
            if (!album)
                return {
                    status: 400,
                    success: false,
                    message: 'GET_ALBUM_BY_ID_EXISTS',
                };

            return {
                status: 200,
                success: true,
                message: 'GET_ALBUM_BY_ID_SUCCESSFULLY',
                data: album,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ALBUM_BY_ID_FAILED',
            };
        }
    }
}
