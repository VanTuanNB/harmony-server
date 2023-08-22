import { v4 as uuidv4 } from 'uuid';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { IHistory } from '@/constraints/interfaces/index.interface';
import HistoryFilter from '@/filters/history.filter';
import ValidatePayload from '@/helpers/validate.helper';
import { historyModel, songModel, userModel } from '@/instances/index.instance';

export default class HistoryService {
    public async getInformation(
        userId: string,
    ): Promise<CustomResponse<IHistory>> {
        try {
            const user = await userModel.getById(userId);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_FOUND',
                };
            const history = await historyModel.getByIdPoPulate(
                user.historyReference ?? '',
            );
            if (!history)
                return {
                    status: 400,
                    success: false,
                    message: 'HISTORY_NOT_FOUND',
                };
            return {
                status: 200,
                success: true,
                message: 'GET_HISTORY_SUCCESSFULLY',
                data: history,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_HISTORY_INFO_FAILED',
                errors: error,
            };
        }
    }

    public async bothCreateUpdate(
        userId: string,
        songId: string,
    ): Promise<CustomResponse<IHistory | null>> {
        try {
            const user = await userModel.getById(userId);
            const song = await songModel.getById(songId);
            if (!song)
                return {
                    status: 400,
                    success: false,
                    message: 'SONG_HAS_ID_NOT_FOUND',
                };
            if (user && user.historyReference) {
                const history = await this.update(
                    user.historyReference,
                    songId,
                );
                return {
                    status: 200,
                    success: true,
                    message: 'PUSH_SONGS_INTO_HISTORY_SUCCESSFULLY',
                    data: history,
                };
            } else {
                const history = await this.create(user?._id ?? '', song._id);
                return {
                    status: 201,
                    success: true,
                    message: 'CREATE_SONGS_INTO_HISTORY_SUCCESSFULLY',
                    data: history,
                };
            }
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'CANT_PUSH_LIST_SONG_IN_TO_HISTORY',
                errors: error,
            };
        }
    }

    private async create(
        userId: string,
        songId: string,
    ): Promise<IHistory | null> {
        try {
            const _id: string = uuidv4();
            const historyFilter = new HistoryFilter({
                _id,
                userReference: userId,
                listSong: [songId],
            });
            const inValid = await ValidatePayload(
                historyFilter,
                'BAD_REQUEST',
                true,
            );
            if (inValid) throw new Error(JSON.stringify(inValid));
            const createHistory = await historyModel.create(historyFilter);
            if (!createHistory) throw new Error('POST_HISTORY_FAILED');
            const updateSong = await userModel.updateById(userId, {
                historyReference: createHistory._id,
            });

            if (!updateSong) {
                await historyModel.forceDelete(createHistory._id);
                return null;
            }
            return createHistory;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    private async update(
        _id: string,
        songId: string,
    ): Promise<IHistory | null> {
        try {
            const currentHistory = await historyModel.getById(_id);
            if (!currentHistory) return null;
            const isValidPushSong = currentHistory.listSong.some(
                (song: string) => song === songId,
            );
            if (isValidPushSong) return null;
            const updated = await historyModel.updateByAction(
                _id,
                songId,
                EnumActionUpdate.PUSH,
            );
            if (updated && updated.listSong.length > 30) {
                await historyModel.removeFirstSongIntoListSong(updated._id);
            }
            return updated;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
