import ISong from '@/constraints/interfaces/ISong';
import songSchema from '@/database/schemas/song.schema';

export default class SongModel {
    public static async getAll(): Promise<ISong[]> {
        const songs = await songSchema
            .find()
            .populate({
                path: 'composerReference',
                strictPopulate: true,
                select: 'name slug',
            })
            .populate({
                path: 'albumReference',
                strictPopulate: true,
                select: 'title',
            })
            .populate({
                path: 'genresReference',
                strictPopulate: true,
                select: 'title',
            })
            .populate({
                path: 'performers',
                strictPopulate: true,
                select: 'name slug',
            });
        return songs;
    }

    public static async getById(_id: string): Promise<ISong | null> {
        const song = await songSchema
            .findById(_id)
            .populate({
                path: 'composerReference',
                strictPopulate: true,
                select: 'name slug',
            })
            .populate({
                path: 'albumReference',
                strictPopulate: true,
                select: 'title',
            })
            .populate({
                path: 'genresReference',
                strictPopulate: true,
                select: 'title',
            })
            .populate({
                path: 'performers',
                strictPopulate: true,
                select: 'name slug',
            });
        return song;
    }

    public static async create(payload: ISong): Promise<ISong> {
        const created = await songSchema.create(payload);
        return created;
    }

    public static async update(
        _id: string,
        payload: Partial<Omit<ISong, '_id' | 'composerReference'>>,
    ): Promise<ISong | null> {
        const updatedField = await songSchema.findByIdAndUpdate(_id, {
            $set: {
                title: payload.title,
                duration: payload.duration,
                publish: payload.publish,
                views: payload.views,
                albumReference: payload.albumReference,
                genresReference: payload.genresReference,
                performers: payload.performers,
                updatedAt: new Date().toUTCString(),
            },
        });
        return updatedField;
    }

    public static async forceDelete(id: string): Promise<ISong | null> {
        const forceDelete = await songSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
