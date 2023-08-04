import path from 'path';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import ThumbnailRepository from '@/repositories/thumbnail.repository';

export default class ThumbnailService {
    public static async getThumbnail(
        slugId: string,
        resize?: string,
    ): Promise<CustomResponse<Buffer>> {
        try {
            return {
                status: 200,
                success: true,
                message: 'TESTING',
            };
            // const thumbnailImg = await ThumbnailModel.getById(slugId);
            // if (!thumbnailImg)
            //     return {
            //         status: 400,
            //         success: false,
            //         message: 'GET_THUMBNAIL_FAILED_ID_NOT_FOUND',
            //     };
            // const filePath = path.join(__dirname, '../../', thumbnailImg.path);
            // const thumbnailRepo =
            //     await ThumbnailRepository.getInformationThumbnail(
            //         filePath,
            //         resize,
            //     );
            // return {
            //     status: 200,
            //     success: true,
            //     message: 'GET_THUMBNAIL_SUCCESSFULLY',
            //     data: thumbnailRepo,
            // };
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
}
