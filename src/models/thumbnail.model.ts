import { IThumbnailSong } from '@/constraints/interfaces/index.interface';
import thumbnailSchema from '@/database/schemas/thumbnail.schema';

export default class ThumbnailModel {
    public static async getById(id: string): Promise<IThumbnailSong | null> {
        const thumbnail = await thumbnailSchema.findById(id);
        return thumbnail;
    }
    public static async create(
        payload: IThumbnailSong,
    ): Promise<IThumbnailSong> {
        const created = await thumbnailSchema.create(payload);
        return created;
    }

    public static async update(
        _id: string,
        payload: Partial<Omit<IThumbnailSong, '_id'>>,
    ): Promise<IThumbnailSong | null> {
        const updated = await thumbnailSchema.findByIdAndUpdate(_id, payload, {
            new: true,
        });
        return updated;
    }

    public static async forceDelete(
        id: string,
    ): Promise<IThumbnailSong | null> {
        const forceDelete = await thumbnailSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
