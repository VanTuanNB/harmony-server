import { v4 as uuidv4 } from 'uuid';
import s3Client from '@/configs/s3.config';
import {
    EContentTypeObjectS3,
    EKeyObjectS3Thumbnail,
} from '@/constraints/enums/s3.enum';
import { IPayloadRequestSignedUrlS3 } from '@/constraints/interfaces/common.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import songDraftModel from '@/models/songDraft.model';
import generateRandomString from '@/utils/generateRandomKey.util';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ISongDraftUpload } from '@/constraints/interfaces/ICollection.interface';

interface IResponseUrlS3 {
    privateUrl: string;
    expired: number;
}

export default class S3Service {
    private expiredTime: number = 3000; // default 5 minutes
    constructor() {}

    public async getSignUrlForUploadAudioS3(
        userId: string,
    ): Promise<CustomResponse> {
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
    ): Promise<CustomResponse> {
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
}
