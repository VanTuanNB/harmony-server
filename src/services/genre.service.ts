import { v4 as uuidv4 } from 'uuid';

import { IGenre } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import GenreModel from '@/models/genre.model';

export default class GenreService {
    public static async create(
        payload: Pick<IGenre, 'title'>,
    ): Promise<CustomResponse> {
        try {
            const genreByTitle = await GenreModel.getByTitle(payload.title);
            if (genreByTitle)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_GENRE_TITLE_IS_EXISTING',
                };
            const _id: string = uuidv4();
            const create = await GenreModel.create({
                _id,
                ...payload,
            });
            return {
                status: 201,
                success: true,
                message: 'POST_GENRE_SUCCESSFULLY',
                data: create,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_GENRE_FAILED',
                errors: error,
            };
        }
    }

    public static async updateMultipleCollection(
        listIdGenre: string[],
        songId: string,
    ): Promise<boolean> {
        try {
            listIdGenre.forEach(async (id: string) => {
                await GenreModel.updatedField(id, {
                    listSong: [songId],
                });
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
