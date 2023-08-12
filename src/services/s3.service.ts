import s3Client from '@/configs/s3.config';
import {
    EContentTypeObjectS3,
    EKeyObjectS3Thumbnail,
} from '@/constraints/enums/s3.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import {
    albumModel,
    songDraftModel,
    songModel,
    userModel,
} from '@/instances/index.instance';
import generateRandomString from '@/utils/generateRandomKey.util';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    GetObjectOutput,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

interface IResponseUrlS3 {
    uploadId: string;
    privateUrl: string;
    expired: number;
    contentType: string;
    keyObjectAudio?: string;
    keyObjectThumbnail?: string;
    keyObjectAlbum?: string;
    keyObjectUserAvatar?: string;
    userId: string;
}

export default class S3Service {
    private expiredTime: number = 3000; // default 5 minutes
    constructor() {}
    public async getFileContentS3(instance: {
        bucketName: string;
        keyObject: string;
        contentType: string;
        range?: string;
    }): Promise<CustomResponse<GetObjectOutput>> {
        try {
            const command = new GetObjectCommand({
                Bucket: instance.bucketName,
                Key: instance.keyObject,
                Range: instance.range,
            });
            const response: GetObjectOutput = await s3Client.send(command);
            if (response && !response.Body)
                throw new Error('CAN_NOT_GET_FILE_S3');
            return {
                status: 200,
                success: true,
                message: 'FILE_CONTENT_S3_SUCCESSFULLY',
                data: response,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_FILE_CONTENT_S3_FAILED',
                errors: error,
            };
        }
    }

    public async getSignUrlForUploadAudioS3(
        userId: string,
    ): Promise<CustomResponse<IResponseUrlS3>> {
        try {
            if (!userId)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const keyObjectAudio = `${generateRandomString(30)}.${
                EContentTypeObjectS3.AUDIO_EXTENSION
            }`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_AUDIO_NAME ?? '',
                Key: keyObjectAudio,
                ContentType: EContentTypeObjectS3.AUDIO,
            });
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            const newSongDraftInstance = await songDraftModel.create({
                _id: uuidv4(),
                audio: {
                    bucketName: process.env.AWS_S3_BUCKET_AUDIO_NAME ?? '',
                    keyObject: keyObjectAudio,
                    contentType: EContentTypeObjectS3.AUDIO,
                    expiredTime: this.expiredTime,
                },
                thumbnail: null,
                userReference: userId,
            });
            return {
                status: 200,
                success: true,
                message: 'GET_SIGNED_URL_FOR_UPLOAD_AUDIO_SUCCESSFULLY',
                data: {
                    uploadId: newSongDraftInstance._id,
                    privateUrl: url,
                    expired: this.expiredTime,
                    contentType: newSongDraftInstance.audio.contentType,
                    keyObjectAudio: newSongDraftInstance.audio.keyObject,
                    userId,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_SIGNED_URL_FOR_UPLOAD_AUDIO_FAILED',
                errors: error,
            };
        }
    }
    public async getSignUrlForUploadThumbnailS3(
        userId: string,
        uploadId: string,
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG,
    ): Promise<CustomResponse<IResponseUrlS3>> {
        try {
            const currentSongDraft = await songDraftModel.getById(uploadId);
            if (!userId || !currentSongDraft)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const keyObjectThumbnail = `${
                EKeyObjectS3Thumbnail.SONG
            }/${generateRandomString(30)}.${contentType}`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                Key: keyObjectThumbnail,
                ContentType: contentType,
            });
            const updateSongDraft = await songDraftModel.updateField(
                currentSongDraft._id,
                {
                    thumbnail: {
                        bucketName: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                        keyObject: keyObjectThumbnail,
                        contentType,
                        expiredTime: this.expiredTime,
                    },
                },
            );
            if (!updateSongDraft) throw new Error('CAN_NOT_UPDATE_SONG_DRAFT');
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            return {
                status: 200,
                success: true,
                message: 'GET_SIGNED_URL_FOR_UPLOAD_THUMBNAIL_SUCCESSFULLY',
                data: {
                    uploadId: updateSongDraft._id,
                    privateUrl: url,
                    expired: this.expiredTime,
                    contentType: updateSongDraft.thumbnail!.contentType,
                    keyObjectThumbnail: updateSongDraft.thumbnail!.keyObject,
                    userId,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_SIGNED_URL_FOR_UPLOAD_THUMBNAIL_FAILED',
                errors: error,
            };
        }
    }

    public async deleteFileOnS3(instance: {
        bucketName: string;
        keyObject: string;
        contentType: string;
    }): Promise<CustomResponse> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: instance.bucketName,
                Key: instance.keyObject,
            });
            const response = await s3Client.send(command);
            return {
                status: 200,
                success: true,
                message: 'DELETE_FILE_S3_SUCCESSFULLY',
                data: response,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'DELETE_FILE_S3_FAILED',
                errors: error,
            };
        }
    }

    public async getSignUrlForUploadAlbum(
        userId: string,
        albumId: string,
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG,
    ): Promise<
        CustomResponse<Omit<IResponseUrlS3, 'uploadId'> & { albumId: string }>
    > {
        try {
            const currentAlbum = await albumModel.getById(albumId);
            if (
                !currentAlbum ||
                (currentAlbum && currentAlbum.userReference !== userId)
            )
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD',
                };

            const keyObjectAlbum = `${
                EKeyObjectS3Thumbnail.ALBUM
            }/${generateRandomString(30)}.${contentType}`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                Key: keyObjectAlbum,
                ContentType: contentType,
            });
            if (currentAlbum.thumbnail) {
                const deleteFileExist = await this.deleteFileOnS3(
                    currentAlbum.thumbnail,
                );
                if (!deleteFileExist.success) return deleteFileExist;
            }
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            await albumModel.updatedField(currentAlbum._id, {
                thumbnail: {
                    bucketName: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                    keyObject: keyObjectAlbum,
                    contentType,
                },
                thumbnailUrl: `${process.env.SERVER_URL}:${process.env.PORT_SERVER}/api/v1/thumbnail/album/${currentAlbum._id}`,
            });
            return {
                status: 200,
                success: true,
                message: 'UPLOAD_FILE_SUCCESSFULLY',
                data: {
                    privateUrl: url,
                    expired: this.expiredTime,
                    contentType,
                    keyObjectAlbum,
                    albumId,
                    userId,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPLOAD_FILE_FAILED',
                errors: error,
            };
        }
    }

    public async getSignUrlForUploadUserAvatar(
        userId: string,
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG,
    ): Promise<CustomResponse<Omit<IResponseUrlS3, 'uploadId'>>> {
        try {
            const currentUser = await userModel.getById(userId);
            if (!currentUser)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD',
                };
            const keyObjectUserAvatar = `${
                EKeyObjectS3Thumbnail.AVATAR
            }/${generateRandomString(30)}.${contentType}`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                Key: keyObjectUserAvatar,
                ContentType: contentType,
            });
            if (currentUser.avatarS3) {
                const deleteFileExist = await this.deleteFileOnS3(
                    currentUser.avatarS3,
                );
                if (!deleteFileExist.success) return deleteFileExist;
            }
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            await userModel.updateById(currentUser._id, {
                avatarS3: {
                    bucketName: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                    keyObject: keyObjectUserAvatar,
                    contentType,
                },
                avatarUrl: `${process.env.SERVER_URL}:${process.env.PORT_SERVER}/api/v1/thumbnail/avatar/${currentUser._id}`,
            });
            return {
                status: 200,
                success: true,
                message: 'UPLOAD_FILE_SUCCESSFULLY',
                data: {
                    privateUrl: url,
                    expired: this.expiredTime,
                    contentType,
                    keyObjectUserAvatar,
                    userId,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPLOAD_FILE_FAILED',
                errors: error,
            };
        }
    }

    public async getSignUrlForUploadThumbnailSong(
        songId: string,
        contentType:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG,
    ): Promise<CustomResponse<Omit<IResponseUrlS3, 'uploadId'>>> {
        try {
            const currentSong = await songModel.getById(songId);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD',
                };
            const keyObjectThumbnail = `${
                EKeyObjectS3Thumbnail.SONG
            }/${generateRandomString(30)}.${contentType}`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                Key: keyObjectThumbnail,
                ContentType: contentType,
            });
            if (currentSong.thumbnail) {
                const deleteFileExist = await this.deleteFileOnS3(
                    currentSong.thumbnail,
                );
                if (!deleteFileExist.success) return deleteFileExist;
            }
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            await songModel.updateThumbnailById(currentSong._id, {
                thumbnail: {
                    bucketName: process.env.AWS_S3_BUCKET_IMAGES ?? '',
                    keyObject: keyObjectThumbnail,
                    contentType,
                },
            });
            return {
                status: 200,
                success: true,
                message: 'UPLOAD_FILE_SUCCESSFULLY',
                data: {
                    privateUrl: url,
                    expired: this.expiredTime,
                    contentType,
                    keyObjectThumbnail,
                    userId: currentSong.userReference,
                },
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPLOAD_FILE_FAILED',
                errors: error,
            };
        }
    }
}
