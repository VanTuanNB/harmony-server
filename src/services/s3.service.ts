import s3Client from '@/configs/s3.config';
import {
    EContentTypeObjectS3,
    EKeyObjectS3,
} from '@/constraints/enums/s3.enum';
import { IPayloadRequestSignedUrlS3 } from '@/constraints/interfaces/common.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import generateRandomString from '@/utils/generateRandomKey.util';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface IResponseUrlS3 {
    privateUrl: string;
    expired: number;
}

export default class S3Service {
    private expiredTime: number = 3000; // default 5 minutes
    constructor() {}
    public async getSignUrlForUploadAudioS3(): Promise<CustomResponse> {
        try {
            const keyObjectAudio = `${
                EKeyObjectS3.AUDIO
            }/${generateRandomString(30)}.${
                EContentTypeObjectS3.AUDIO_EXTENSION
            }`;
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME ?? '',
                Key: keyObjectAudio,
                ContentType: EContentTypeObjectS3.AUDIO,
            });
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: this.expiredTime,
            });
            return {
                status: 200,
                success: true,
                message: 'GET_SIGNED_URL_FOR_UPLOAD_AUDIO_SUCCESSFULLY',
                data: {
                    privateUrl: url,
                    expired: this.expiredTime,
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
    public async signedUrlS3(
        payload: IPayloadRequestSignedUrlS3,
    ): Promise<CustomResponse<IResponseUrlS3>> {
        let command = null;
        switch (payload.method) {
            case 'GET':
                command = new GetObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME ?? '',
                    Key: payload.key,
                });
                break;
            case 'POST':
                command = new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME ?? '',
                    Key: `audio/${generateRandomString(30)}.mp3`,
                    ContentType: 'audio/mpeg',
                });
                break;
        }
        if (!command) throw new Error('COMMAND_IS_NULL');
        try {
            const expired = 3000;
            const url = await getSignedUrl(s3Client, command, {
                expiresIn: expired,
            });
            return {
                status: 200,
                success: true,
                message: `${payload.method}_SIGNED_URL_SUCCESSFULLY`,
                data: {
                    privateUrl: url,
                    expired: expired,
                },
            };
        } catch (error) {
            return {
                status: 413,
                success: false,
                message: `${payload.method}_SIGNED_URL_FAILED`,
                errors: error,
            };
        }
    }
}
