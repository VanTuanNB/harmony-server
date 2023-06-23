import IHistory from '@/constraints/interfaces/IHistory';
import historySchema from '@/database/schemas/history.schema';

export default class HistoryModel {
    public static async create(
        payload: Omit<IHistory, '_id'>,
    ): Promise<IHistory> {
        const create = await historySchema.create(payload);
        return create;
    }
}
