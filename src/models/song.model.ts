import ISong from '@/constraints/interfaces/ISong';
import songSchema from '@/database/schemas/song.schema';

export default class SongModel {
    public static async create(payload: ISong): Promise<ISong> {
        const created = await songSchema.create(payload);
        return created;
    }
}
