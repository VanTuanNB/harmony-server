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
        const updatedField = await songSchema.findByIdAndUpdate(
            _id,
            {
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
            },
            {
                new: true,
            },
        );
        return updatedField;
    }

    public static async updateByAction(
        _id: string,
        payload: Partial<Omit<ISong, '_id' | 'composerReference'>>,
        options: 'remove' | 'push',
    ): Promise<ISong | null> {
        switch (options) {
            case 'push':
                const pushUpdated = await songSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: {
                            title: payload.title,
                            duration: payload.duration,
                            publish: payload.publish,
                            views: payload.views,
                            updatedAt: new Date().toUTCString(),
                        },
                        $push: {
                            albumReference: payload.albumReference,
                            genresReference: payload.genresReference,
                            performers: payload.performers,
                        },
                    },
                    {
                        new: true,
                    },
                );
                return pushUpdated;
            case 'remove':
                const removeUpdated = await songSchema.findByIdAndUpdate(
                    _id,
                    {
                        $set: {
                            title: payload.title,
                            duration: payload.duration,
                            publish: payload.publish,
                            views: payload.views,
                            updatedAt: new Date().toUTCString(),
                        },
                        $pull: {
                            albumReference: payload.albumReference,
                            genresReference: payload.genresReference,
                            performers: payload.performers,
                        },
                    },
                    {
                        new: true,
                    },
                );
                return removeUpdated;
            default:
                throw new Error('Action not supported');
        }
    }

    public static async forceDelete(id: string): Promise<ISong | null> {
        const forceDelete = await songSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
