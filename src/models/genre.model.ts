import IGenre from '@/constraints/interfaces/IGenre';
import genreSchema from '@/database/schemas/genre.schema';

export default class GenreModel {
    public static async getByTitle(title: string): Promise<IGenre | null> {
        const genreByTitle = await genreSchema.findOne({
            title: { $regex: title, $options: 'i' },
        });
        return genreByTitle;
    }
    public static async create(payload: IGenre): Promise<IGenre> {
        const created = await genreSchema.create(payload);
        return created;
    }

    public static async updateManyActionSongReference(
        _id: string[],
        songReference: string,
        options: 'push' | 'remove',
    ): Promise<IGenre | null> {
        switch (options) {
            case 'remove':
                const removeUpdated = await genreSchema.findByIdAndUpdate(
                    _id,
                    {
                        $pull: { listSong: songReference },
                    },
                    { new: true },
                );
                return removeUpdated;
            case 'push':
                const pushUpdated = await genreSchema.findByIdAndUpdate(
                    _id,
                    {
                        $push: { listSong: songReference },
                    },
                    { new: true },
                );
                return pushUpdated;
            default:
                throw new Error('INVALID ACTION TYPE UPDATE');
        }
    }

    public static async updatedField(
        id: string,
        payload: Partial<Omit<IGenre, '_id'>>,
    ): Promise<IGenre | null> {
        const updatedField = await genreSchema.findByIdAndUpdate(id, {
            $set: {
                title: payload.title,
                updatedAt: new Date().toUTCString(),
            },
            $push: { listSong: payload.listSong },
        });
        return updatedField;
    }

    public static async updatedPullField(
        id: string,
        payload: Partial<Omit<IGenre, '_id'>>,
    ): Promise<IGenre | null> {
        const updatedField = await genreSchema.findByIdAndUpdate(id, {
            $set: {
                title: payload.title,
                updatedAt: new Date().toUTCString(),
            },
            $pull: { listSong: payload.listSong },
        });
        return updatedField;
    }
}
