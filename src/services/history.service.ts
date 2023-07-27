import { v4 as uuidv4 } from 'uuid';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { IHistory } from '@/constraints/interfaces/index.interface';
import UserModel from '@/models/user.model';
import HistoryFilter from '@/filters/history.filter';
import ValidatePayload from '@/helpers/validate.helper';
import SongModel from '@/models/song.model';
import HistoryModel from '@/models/history.model';
import { EnumActionUpdate } from '@/constraints/enums/action.enum';

export default class HistoryService {
    protected async getInformation(
        userId: string,
    ): Promise<CustomResponse<IHistory>> {
        try {
            const user = await UserModel.getById(userId);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_FOUND',
                };
            const history = await HistoryModel.getByIdPoPulate(
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

    protected async bothCreateUpdate(
        userId: string,
        songId: string,
    ): Promise<CustomResponse<IHistory>> {
        try {
            const user = await UserModel.getById(userId);
            const song = await SongModel.getById(songId);
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
                if (!history)
                    return {
                        status: 400,
                        success: false,
                        message: 'UPDATE_HISTORY_FAILED',
                    };
                return {
                    status: 200,
                    success: true,
                    message: 'PUSH_SONGS_INTO_HISTORY_SUCCESSFULLY',
                    data: history,
                };
            } else {
                const history = await this.create(user?._id ?? '', song._id);
                if (!history)
                    return {
                        status: 400,
                        success: false,
                        message: 'CREATE_HISTORY_FAILED',
                    };
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
                listSong: [songId],
            });
            const inValid = await ValidatePayload(
                historyFilter,
                'BAD_REQUEST',
                true,
            );
            if (inValid) throw new Error(JSON.stringify(inValid));
            const createHistory = await HistoryModel.create(historyFilter);
            if (!createHistory) throw new Error('POST_HISTORY_FAILED');
            const updateSong = await UserModel.updateById(userId, {
                historyReference: createHistory._id,
            });

            if (!updateSong) {
                await HistoryModel.forceDelete(createHistory._id);
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
            const currentHistory = await HistoryModel.getById(_id);
            if (!currentHistory) return null;
            const isValidPushSong = currentHistory.listSong.some(
                (song: string) => song === songId,
            );
            if (isValidPushSong) return null;
            const updated = await HistoryModel.updateByAction(
                _id,
                songId,
                EnumActionUpdate.PUSH,
            );
            if (updated && updated.listSong.length > 30) {
                await HistoryModel.removeFirstSongIntoListSong(updated._id);
            }
            return updated;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
