import IGenre from '@/constraints/interfaces/IGenre';
import genreSchema from '@/database/schemas/genre.schema';

export default class GenreModel {
    public static async create(payload: IGenre): Promise<IGenre> {
        const created = await genreSchema.create(payload);
        return created;
    }
    public static async updatedField(
        id: string,
        payload: Partial<Omit<IGenre, '_id'>>,
    ): Promise<IGenre | null> {
        const updatedField = await genreSchema.findByIdAndUpdate(id, {
            $set: {
                title: payload.title,
                updatedAt: payload.updatedAt,
            },
            $push: { listSong: payload.listSong },
        });
        return updatedField;
    }
}
