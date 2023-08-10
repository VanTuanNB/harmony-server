import { v4 as uuidv4 } from 'uuid';

import { IGenre } from '@/constraints/interfaces/index.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { genreModel } from '@/instances/index.instance';

export default class GenreService {
    public async create(
        payload: Pick<IGenre, 'title'>,
    ): Promise<CustomResponse> {
        try {
            const genreByTitle = await genreModel.getByTitle(payload.title);
            if (genreByTitle)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_GENRE_TITLE_IS_EXISTING',
                };
            const _id: string = uuidv4();
            const create = await genreModel.create({
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

    public async updateMultipleCollection(
        listIdGenre: string[],
        songId: string,
    ): Promise<boolean> {
        try {
            listIdGenre.forEach(async (id: string) => {
                await genreModel.updatedField(id, {
                    listSong: [songId],
                });
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
    public async getAll(): Promise<CustomResponse<IGenre[] | []>> {
        try {
            const genres = await genreModel.getAll();
            return {
                status: 200,
                success: true,
                message: 'GET_ALL_GENRE_SUCCESSFULLY',
                data: genres,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ALL_GENRE_FAILED',
                errors: error,
            };
        }
    }

    public async updateBySongEventUpdate(
        listGenreId: string[],
        songId: string,
    ): Promise<CustomResponse> {
        try {
            const listGenreBySongId =
                await genreModel.getMultipleBySongReference(
                    listGenreId,
                    songId,
                );
            const mapping = listGenreBySongId.map((genre) => genre._id);
            const filterIdNotPercent = listGenreId.filter(
                (genreId) => mapping.indexOf(genreId) === -1,
            );
            if (filterIdNotPercent.length) {
                await genreModel.updateManyActionSongReference(
                    filterIdNotPercent,
                    songId,
                    EnumActionUpdate.PUSH,
                );
            } else {
                const listAllById = (
                    await genreModel.getListBySongId(songId)
                ).map((genre) => genre._id);
                const listPullListSong = listAllById.filter(
                    (albumId) => listGenreId.indexOf(albumId) === -1,
                );
                if (listPullListSong.length)
                    await genreModel.updateManyActionSongReference(
                        listPullListSong,
                        songId,
                        EnumActionUpdate.REMOVE,
                    );
            }

            return {
                status: 200,
                success: true,
                message: 'UPDATE_GENRE_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_GENRE_FAILED',
                errors: error,
            };
        }
    }
}
