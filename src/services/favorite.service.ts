import { v4 as uuidv4 } from 'uuid';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { IFavorite } from '@/constraints/interfaces/index.interface';
import FavoriteFilter from '@/filters/favorite.filter';
import ValidatePayload from '@/helpers/validate.helper';
import {
    favoriteModel,
    songModel,
    userModel,
} from '@/instances/index.instance';

export default class FavoriteService {
    public async information(
        userId: string,
    ): Promise<CustomResponse<IFavorite | null>> {
        try {
            const user = await userModel.getById(userId);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_FOUND',
                };
            const favorite = await favoriteModel.getByIdPoPulate(
                user.favoriteListReference ?? '',
            );
            if (!favorite)
                return {
                    status: 400,
                    success: false,
                    message: 'FAVORITE_NOT_FOUND',
                };
            return {
                status: 200,
                success: true,
                message: 'GET_FAVORITE_SUCCESSFULLY',
                data: favorite,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_FAVORITE_FAILED',
                errors: error,
            };
        }
    }

    public async combineCreateUpdate(
        userId: string,
        songId: string,
        actions?: EnumActionUpdate,
    ): Promise<CustomResponse<IFavorite>> {
        try {
            const user = await userModel.getById(userId);
            const song = await songModel.getById(songId);
            if (!song || !user)
                return {
                    status: 400,
                    success: false,
                    message: 'SONG_ID_NOT_FOUND',
                };
            if (user.favoriteListReference && actions) {
                const updated = await this.update(
                    user.favoriteListReference,
                    songId,
                    actions,
                );
                if (!updated)
                    return {
                        status: 400,
                        success: false,
                        message: 'UPDATE_FAVORITE_FAILED',
                    };
                return {
                    status: 200,
                    success: true,
                    message: 'UPDATE_FAVORITE_SUCCESSFULLY',
                    data: updated,
                };
            } else {
                const created = await this.create(
                    userId,
                    user.favoriteListReference ?? '',
                    songId,
                );
                if (created === null)
                    return {
                        status: 400,
                        success: false,
                        message: 'CREATE_FAVORITE_FAILED',
                    };
                return {
                    status: 201,
                    success: true,
                    message: 'CREATE_FAVORITE_SUCCESSFULLY',
                    data: created,
                };
            }
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'COMBINE_FAVORITE_FAILED',
                errors: error,
            };
        }
    }

    private async create(
        userId: string,
        currentFavoriteId: string,
        songId: string,
    ): Promise<IFavorite | null> {
        try {
            const validFavorite = await favoriteModel.getById(
                currentFavoriteId,
            );
            if (validFavorite) return null;
            const _id: string = uuidv4();
            const favoriteFilter = new FavoriteFilter({
                _id,
                listSong: [songId],
                userReference: userId,
            });
            const isInvalid = await ValidatePayload(
                favoriteFilter,
                'BAD_REQUEST',
                true,
            );
            if (isInvalid) return null;
            const create = await favoriteModel.create(favoriteFilter);
            await userModel.updateById(userId, {
                favoriteListReference: create._id,
            });
            return create;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    private async update(
        _id: string,
        songId: string,
        actions: EnumActionUpdate,
    ): Promise<IFavorite | null> {
        try {
            const currentFavorite = await favoriteModel.getById(_id);
            if (!currentFavorite) return null;
            switch (actions) {
                case EnumActionUpdate.PUSH:
                    const isInvalid = currentFavorite.listSong.some(
                        (id: string) => id === songId,
                    );
                    if (isInvalid) return null;
                    const pushUpdate = await favoriteModel.updateByAction(
                        _id,
                        songId,
                        actions,
                    );
                    return pushUpdate;
                case EnumActionUpdate.REMOVE:
                    const isInvalidRemove = currentFavorite.listSong.some(
                        (id: string) => id === songId,
                    );
                    if (!isInvalidRemove) return null;
                    const removeUpdate = await favoriteModel.updateByAction(
                        _id,
                        songId,
                        actions,
                    );
                    return removeUpdate;
                default:
                    throw new Error(
                        'Invalid action favorite it not match push or remove',
                    );
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

// ngày mai làm phần update favorite
// update genres flow như album
// update history
// update song
// delete cho từng collection
// queue currency
