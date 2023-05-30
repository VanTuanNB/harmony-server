import { ISong } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';
import SongRepository from '@/repositories/song.repository';
import { v4 as uuidv4 } from 'uuid';
import SongFilter from '@/filters/song.filter';
import ValidatePayload from '@/helpers/validate.helper';
import handleDeleteFile from '@/helpers/deleteFile.helper';

interface ITypeFiles {
    thumbnail: Express.Multer.File;
    fileSong: Express.Multer.File;
}

export default class SongService {
    public static async create(
        files: ITypeFiles,
        payload: Omit<
            ISong,
            | '_id'
            | 'duration'
            | 'thumbnail'
            | 'createdAt'
            | 'updatedAt'
            | 'songPathId'
        >,
    ): Promise<CustomResponse> {
        try {
            const fileSongInfo = await SongRepository.getInformationFileSong(
                files.fileSong,
            );
            const _id = uuidv4();
            const songFilter = new SongFilter({
                ...payload,
                _id,
                duration: fileSongInfo.format.duration as number,
                thumbnail: `eqweqweqw`,
                songPathId: { _id: 'eqwewqewq' },
            });
            const songInValid = await ValidatePayload(
                songFilter,
                'BAD_REQUEST',
                true,
            );
            console.log(songInValid);
            if (songInValid) {
                handleDeleteFile(files.fileSong);
                handleDeleteFile(files.thumbnail);
                return songInValid;
            }

            return {
                status: 201,
                success: true,
                message: 'POST_SONG_SUCCESSFULLY',
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
}
