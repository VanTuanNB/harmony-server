import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { ISong } from '@/constraints/interfaces/index.interface';
import songSchema from '@/database/schemas/song.schema';
import { UpdateWriteOpResult } from 'mongoose';

export default class SongModel {
    public async getAll(): Promise<ISong[]> {
        const songs = await songSchema
            .find()
            .populate({
                path: 'userReference',
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

    public async getById(_id: string): Promise<ISong | null> {
        const song = await songSchema
            .findById(_id)
            .populate({
                path: 'userReference',
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

    public async getSongJustReleasedPopulate(item: number): Promise<ISong[]> {
        const count = await songSchema.countDocuments({
            createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 14)) }
        });
        const random = Math.floor(Math.random() * count);
        const songs = await songSchema.find({
            createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 14)) }
        }).skip(random).limit(item)
            .populate({
                path: 'userReference',
                strictPopulate: true,
                select: 'name nickname thumbnailUrl',
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
                select: 'name nickname thumbnailUrl',
            });
        return songs;
    }


    public async getSongTopView(id: number): Promise<ISong[]> {
        const songs = await songSchema
            .find({}).sort({ views: -1 }).limit(id)
            .populate({
                path: 'userReference',
                strictPopulate: true,
                select: 'name nickname thumbnailUrl',
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
            }).populate({
                path: 'performers',
                strictPopulate: true,
                select: 'name nickname thumbnailUrl',
            })
        return songs;
    }

    public async search(title: string): Promise<ISong[]> {
        const songQuery = songSchema.find({
            $or: [
                { title: { $regex: title, $options: 'i' } },
            ]
        }).select('title thumbnailUrl performers')
            .populate({
                path: 'performers',
                strictPopulate: true,
                select: 'name nickname thumbnailUrl',
            })
        return songQuery;
    }

    public async getByArrayId(_id: string[]): Promise<ISong[] | null> {
        const songs = await songSchema.find({ _id });
        return songs;
    }

    public async getByIdNoPopulate(_id: string): Promise<ISong | null> {
        const song = await songSchema.findById(_id);
        return song;
    }

    public async getByIdSelectSongPathReference(
        _id: string,
    ): Promise<ISong | null> {
        const song = await songSchema.findById(_id).select('songPathReference');
        return song;
    }

    public async getMultipleByAlbumReference(
        _id: string[],
        albumReference: string,
    ): Promise<ISong[]> {
        const songs = await songSchema
            .find({ _id })
            .where('albumReference')
            .equals(albumReference);
        return songs;
    }

    public async getMultipleByGenreReference(
        _id: string[],
        genresReference: string,
    ): Promise<ISong[]> {
        const songs = await songSchema
            .find({ _id })
            .where('genresReference')
            .equals(genresReference);
        return songs;
    }

    public async getListByAlbumReference(
        albumReference: string,
    ): Promise<ISong[]> {
        const songs = await songSchema.find({
            albumReference: albumReference,
        });
        return songs;
    }

    public async getListByGenreReference(
        genreReference: string,
    ): Promise<ISong[]> {
        const songs = await songSchema.find({
            genresReference: genreReference,
        });
        return songs;
    }

    public async create(payload: ISong): Promise<ISong> {
        const created = await songSchema.create(payload);
        return created;
    }

    public async updateField(
        _id: string,
        payload: Pick<
            ISong,
            | 'albumReference'
            | 'genresReference'
            | 'performers'
            | 'publish'
            | 'title'
        >,
    ): Promise<ISong | null> {
        const updatedField = await songSchema.findByIdAndUpdate(
            _id,
            {
                $set: {
                    title: payload.title,
                    publish: payload.publish,
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

    public async updateByAction(
        listId: string[],
        payload: Partial<Omit<ISong, '_id' | 'userReference'>>,
        options: EnumActionUpdate,
    ): Promise<UpdateWriteOpResult> {
        switch (options) {
            case EnumActionUpdate.PUSH:
                const pushUpdated = await songSchema.updateMany(
                    {
                        _id: { $in: listId },
                    },
                    {
                        $set: {
                            title: payload.title,
                            publish: payload.publish,
                            performers: payload.performers,
                            updatedAt: new Date().toUTCString(),
                        },
                        $push: {
                            albumReference: payload.albumReference,
                            genresReference: payload.genresReference,
                        },
                    },
                );
                return pushUpdated;
            case EnumActionUpdate.REMOVE:
                const removeUpdated = await songSchema.updateMany(
                    {
                        _id: { $in: listId },
                    },
                    {
                        $set: {
                            title: payload.title,
                            publish: payload.publish,
                            performers: payload.performers,
                            updatedAt: new Date().toUTCString(),
                        },
                        $pull: {
                            albumReference: { $in: payload.albumReference },
                            genresReference: { $in: payload.genresReference },
                        },
                    },
                );
                return removeUpdated;
            default:
                throw new Error('Action not supported');
        }
    }

    public async updateIncreaseAlbumReference(
        listId: string[],
        albumId: string,
    ): Promise<UpdateWriteOpResult> {
        return await songSchema.updateMany(
            { _id: listId },
            {
                $push: { albumReference: albumId },
            },
            { new: true },
        );
    }

    public async updateThumbnailById(
        _id: string,
        payload: Pick<ISong, 'thumbnail'>,
    ): Promise<ISong | null> {
        return await songSchema.findByIdAndUpdate(
            _id,
            {
                $set: {
                    thumbnail: payload.thumbnail,
                },
            },
            { new: true },
        );
    }

    public async increaseView(_id: string): Promise<ISong | null> {
        return await songSchema.findByIdAndUpdate(_id, {
            $inc: { views: 1 },
        });
    }
    public async forceDelete(id: string): Promise<ISong | null> {
        const forceDelete = await songSchema.findByIdAndDelete(id);
        return forceDelete;
    }
}
