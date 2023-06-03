import IThumbnailSong from '@/constraints/interfaces/IThumbnailSong';
import thumbnailSchema from '@/database/schemas/thumbnail.schema';

export default class ThumbnailModel {
    public static async create(
        payload: IThumbnailSong,
    ): Promise<IThumbnailSong> {
        const created = await thumbnailSchema.create(payload);
        return created;
    }

    public static async forceDelete(
        id: string,
    ): Promise<IThumbnailSong | null> {
        const forceDelete = await thumbnailSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
