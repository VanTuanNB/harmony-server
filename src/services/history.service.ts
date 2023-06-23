import { v4 as uuidv4 } from 'uuid';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import UserModel from '@/models/user.model';
import HistoryFilter from '@/filters/history.filter';
import ValidatePayload from '@/helpers/validate.helper';
import SongModel from '@/models/song.model';
import HistoryModel from '@/models/history.model';

export default class HistoryService {
    public static async create(
        id: string,
        listSong: string[],
    ): Promise<CustomResponse> {
        try {
            const user = await UserModel.getById(id);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_FOUND',
                };
            const songs = await SongModel.getByArrayId(listSong);
            console.log(songs);
            if (
                songs &&
                (songs.length === 0 || songs.length !== listSong.length)
            )
                return {
                    status: 400,
                    success: false,
                    message: 'LIST_SONG_NOT_FOUND',
                };
            const _id: string = uuidv4();
            const historyFilter = new HistoryFilter({
                _id,
                listSong,
            });
            const inValid = await ValidatePayload(
                historyFilter,
                'BAD_REQUEST',
                true,
            );
            if (inValid) return inValid;
            const createHistory = await HistoryModel.create(historyFilter);
            if (!createHistory) throw new Error('POST_HISTORY_FAILED');
            return {
                status: 201,
                success: true,
                message: 'POST_HISTORY_SONG_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_HISTORY_SONG_FAILED',
                errors: error,
            };
        }
    }

    public static async update(
        _id: string,
        userId: string,
        listSong: string[],
        flagAction: string,
    ): Promise<CustomResponse> {
        try {
            const user = await UserModel.getById(userId);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_FOUND',
                };
            return {
                status: 200,
                success: true,
                message: 'UPDATE_HISTORY_SONG_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'UPDATE_HISTORY_SONG_FAILED',
                errors: error,
            };
        }
    }
}
