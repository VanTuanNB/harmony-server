import { UpdateWriteOpResult } from 'mongoose';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import IGenre from '@/constraints/interfaces/IGenre';
import genreSchema from '@/database/schemas/genre.schema';

export default class GenreModel {
    public static async getByTitle(title: string): Promise<IGenre | null> {
        const genreByTitle = await genreSchema.findOne({
            title: { $regex: title, $options: 'i' },
        });
        return genreByTitle;
    }

    public static async getMultipleBySongReference(
        _id: string[],
        songReference: string,
    ): Promise<IGenre[]> {
        const albums = await genreSchema
            .find({ _id })
            .where('listSong')
            .equals(songReference);
        return albums;
    }

    public static async getById(_id: string): Promise<IGenre|null> {
        const genre = await genreSchema
            .findById(_id)
            .populate({
                path: 'listSong',
                strictPopulate: true,
                select: ''
            });
            return genre;
    }

    public static async create(payload: IGenre): Promise<IGenre> {
        const created = await genreSchema.create(payload);
        return created;
    }

    public static async updateManyActionSongReference(
        _id: string[],
        songReference: string,
        options: EnumActionUpdate,
    ): Promise<UpdateWriteOpResult> {
        switch (options) {
            case EnumActionUpdate.REMOVE:
                const removeUpdated = await genreSchema
                    .find({ _id })
                    .updateMany({
                        $pull: { listSong: songReference },
                    });
                return removeUpdated;
            case EnumActionUpdate.PUSH:
                const pushUpdated = await genreSchema.find({ _id }).updateMany({
                    $push: { listSong: songReference },
                });
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
