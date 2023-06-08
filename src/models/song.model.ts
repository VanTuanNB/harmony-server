import ISong from '@/constraints/interfaces/ISong';
import songSchema from '@/database/schemas/song.schema';

export default class SongModel {
    public static async getAll(): Promise<ISong[]> {
        const songs = await songSchema.find().populate({
            path: 'composerReference',
            strictPopulate: true,
            select: '',
        });
        return songs;
    }
    public static async create(payload: ISong): Promise<ISong> {
        const created = await songSchema.create(payload);
        return created;
    }

    public static async forceDelete(id: string): Promise<ISong | null> {
        const forceDelete = await songSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
