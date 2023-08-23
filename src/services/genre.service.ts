import { v4 as uuidv4 } from 'uuid';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { IGenre } from '@/constraints/interfaces/index.interface';
import { genreModel, songService } from '@/instances/index.instance';

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



    public async updateById(
        _id: string,
        payload: Omit<IGenre, '_id'>,
    ): Promise<CustomResponse> {
        try {
            const currentGenre = await genreModel.getById(_id);
            if (!currentGenre)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST',
                };
            const updated = await genreModel.updatedField(_id, {
                title: payload.title,
                listSong: payload.listSong,
            });
            if (!updated) throw new Error('UPDATED_FAILED');
            if (payload.listSong) {
                const updateListSong =
                    await songService.updateByGenreEventUpdate(
                        payload.listSong,
                        _id,
                    );
                if (!updateListSong.success) return updateListSong;
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
            };
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

    public async getTop4Item(item: number): Promise<CustomResponse<IGenre[] | null>> {
        try {
            const genres = await genreModel.getTopGenre(item);
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

    public async getTopListSong(): Promise<CustomResponse<IGenre[] | null>> {
        try {
            const genres = await genreModel.getTopListSong()
            return {
                status: 200,
                success: true,
                message: 'GET_TOP_GENRE_SUCCESSFULLY',
                data: genres,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_TOP_GENRE_FAILED',
                errors: error,
            };
        }
    }

    public async getById(id: string): Promise<CustomResponse<IGenre | null>> {
        try {
            const genres = await genreModel.getByIdPopulate(id);
            if (!genres) return {
                status: 400,
                success: false,
                message: 'BAD_REQUEST',
            }
            return {
                status: 200,
                success: true,
                message: 'GET_GENRE_BY_ID_SUCCESSFULLY',
                data: genres,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_GENRE_BY_ID_FAILED',
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
