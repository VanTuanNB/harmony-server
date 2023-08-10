import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import sharp from 'sharp';
import { Readable } from 'stream';
import { EContentTypeObjectS3 } from '@/constraints/enums/s3.enum';
import {
    albumModel,
    s3Service,
    songModel,
    userModel,
} from '@/instances/index.instance';

export default class ThumbnailService {
    constructor() {}

    public async getThumbnailSong(
        slugId: string,
        resize?: string,
    ): Promise<CustomResponse<any>> {
        try {
            const currentSong = await songModel.getById(slugId);
            if (!currentSong)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_GET_THUMBNAIL',
                };
            const fileContent = await s3Service.getFileContentS3(
                currentSong.thumbnail,
            );
            const { data } = fileContent;
            if (!data || !data.Body)
                throw new Error('GET_FILE_THUMBNAIL_FAILED');
            const bufferData = await this.streamToBuffer(data.Body as Readable);
            const translateThumbnail = await this.translateThumbnailFromS3(
                bufferData,
                EContentTypeObjectS3.JPEG,
                resize,
            );
            return {
                status: 200,
                success: true,
                message: 'GET_THUMBNAIL_SUCCESSFULLY',
                data: translateThumbnail,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_THUMBNAIL_FAILED',
                errors: error,
            };
        }
    }

    public async getThumbnailAlbum(
        slugId: string,
        resize?: string,
    ): Promise<CustomResponse<any>> {
        try {
            const currentAlbum = await albumModel.getById(slugId);
            if (!currentAlbum || currentAlbum.thumbnail === null)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_GET_THUMBNAIL',
                };
            const fileContent = await s3Service.getFileContentS3(
                currentAlbum.thumbnail,
            );
            const { data } = fileContent;
            if (!data || !data.Body)
                throw new Error('GET_FILE_THUMBNAIL_FAILED');
            const bufferData = await this.streamToBuffer(data.Body as Readable);
            const translateThumbnail = await this.translateThumbnailFromS3(
                bufferData,
                EContentTypeObjectS3.JPEG,
                resize,
            );
            return {
                status: 200,
                success: true,
                message: 'GET_THUMBNAIL_SUCCESSFULLY',
                data: translateThumbnail,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_THUMBNAIL_FAILED',
                errors: error,
            };
        }
    }

    public async getThumbnailUserAvatar(
        slugId: string,
        resize?: string,
    ): Promise<CustomResponse<any>> {
        try {
            const currentUser = await userModel.getById(slugId);
            if (!currentUser || currentUser.avatarS3 === null)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_GET_THUMBNAIL',
                };
            const fileContent = await s3Service.getFileContentS3(
                currentUser.avatarS3,
            );
            const { data } = fileContent;
            if (!data || !data.Body)
                throw new Error('GET_FILE_THUMBNAIL_FAILED');
            const bufferData = await this.streamToBuffer(data.Body as Readable);
            const translateThumbnail = await this.translateThumbnailFromS3(
                bufferData,
                EContentTypeObjectS3.JPEG,
                resize,
            );
            return {
                status: 200,
                success: true,
                message: 'GET_THUMBNAIL_SUCCESSFULLY',
                data: translateThumbnail,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_THUMBNAIL_FAILED',
                errors: error,
            };
        }
    }

    private async translateThumbnailFromS3(
        path:
            | Buffer
            | ArrayBuffer
            | Uint8Array
            | Uint8ClampedArray
            | Int8Array
            | Uint16Array
            | Int16Array
            | Uint32Array
            | Int32Array
            | Float32Array
            | Float64Array
            | string,
        outputExtensionsFile:
            | EContentTypeObjectS3.JPEG
            | EContentTypeObjectS3.JPG
            | EContentTypeObjectS3.PNG,
        resize?: string,
    ) {
        return new Promise<Buffer>((resolve, reject) => {
            if (resize) {
                sharp(path)
                    .toFormat(outputExtensionsFile)
                    .resize(
                        Number.parseInt(resize.split('x')[0]),
                        Number.parseInt(resize.split('x')[1]),
                    )
                    .toBuffer((err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
            } else {
                sharp(path)
                    .toFormat(outputExtensionsFile)
                    .toBuffer((err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
            }
        });
    }

    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => {
                chunks.push(Buffer.from(chunk));
            });
            stream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
}
