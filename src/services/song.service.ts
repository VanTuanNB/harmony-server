import { ISong } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';

interface ITypeFiles {
    thumbnail: Express.Multer.File;
    fileSong: Express.Multer.File;
}

export default class SongService {
    public static async create(
        files: ITypeFiles,
        payload: Pick<ISong, 'title' | 'publish'>,
    ): Promise<CustomResponse> {
        try {
            console.log(payload);
            return {
                status: 201,
                success: true,
                message: 'POST_SONG_SUCCESSFULLY',
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'POST_SONG_FAILED',
                errors: error,
            };
        }
    }
}
