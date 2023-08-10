import { UpdateWriteOpResult } from 'mongoose';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IGenre } from '@/constraints/interfaces/index.interface';
import genreSchema from '@/database/schemas/genre.schema';

export default class GenreModel {
    public async getByTitle(title: string): Promise<IGenre | null> {
        const genreByTitle = await genreSchema.findOne({
            title: { $regex: title, $options: 'i' },
        });
        return genreByTitle;
    }

    public async getMultipleBySongReference(
        _id: string[],
        songReference: string,
    ): Promise<IGenre[]> {
        const albums = await genreSchema
            .find({ _id })
            .where('listSong')
            .equals(songReference);
        return albums;
    }

    public async getListId(_id: string[]): Promise<IGenre[]> {
        const genre = await genreSchema.find({
            _id,
        });
        return genre;
    }

    public async getListBySongId(songId: string): Promise<IGenre[]> {
        const genres = await genreSchema.find({
            listSong: songId,
        });
        return genres;
    }

    public async create(payload: IGenre): Promise<IGenre> {
        const created = await genreSchema.create(payload);
        return created;
    }

    public async updateManyActionSongReference(
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

    public async updatedField(
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

    public async updatedPullField(
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

    public async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await genreSchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }

    public async getAll(): Promise<IGenre[]> {
        const genres = genreSchema.find().populate({
            path: 'listSong',
            strictPopulate: true,
            select: 'title thumbnail songPathReference',
        });

        return genres;
    }
}
