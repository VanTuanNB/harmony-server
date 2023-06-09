import ISongPath from '@/constraints/interfaces/ISongPath';
import songPathSchema from '@/database/schemas/songPath.schema';

export default class SongPathModel {
    public static async getById(id: string): Promise<ISongPath | null> {
        const songPath = await songPathSchema.findById(id);
        return songPath;
    }

    public static async create(payload: ISongPath): Promise<ISongPath> {
        const created = await songPathSchema.create(payload);
        return created;
    }

    public static async update(
        _id: string,
        payload: Partial<Omit<ISongPath, '_id'>>,
    ): Promise<ISongPath | null> {
        const updated = await songPathSchema.findByIdAndUpdate(_id, payload);
        return updated;
    }

    public static async forceDelete(id: string): Promise<ISongPath | null> {
        const forceDelete = await songPathSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
