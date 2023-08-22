import { UpdateWriteOpResult } from 'mongoose';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import { IAlbum } from '@/constraints/interfaces/index.interface';
import albumSchema from '@/database/schemas/album.schema';

export default class AlbumModel {
    public async getAll(): Promise<IAlbum[]> {
        const album = await albumSchema.find();
        return album;
    }
    public async getByComposerAndTitle(
        idComposer: string,
        title: string,
    ): Promise<IAlbum | null> {
        const albumByComposer = await albumSchema.findOne({
            userReference: idComposer,
            title: { $regex: title, $options: 'i' },
        });
        return albumByComposer;
    }

    public async getListId(_id: string[]): Promise<IAlbum[]> {
        const album = await albumSchema.find({
            _id,
        });
        return album;
    }

    public async getListBySongId(songId: string): Promise<IAlbum[]> {
        const album = await albumSchema.find({
            listSong: songId,
        });
        return album;
    }

    public async getBySongReference(
        _id: string,
        songReference: string,
    ): Promise<IAlbum | null> {
        const album = await albumSchema.findOne({
            _id,
            listSong: songReference,
        });
        return album;
    }

    public async getMultipleBySongReference(
        _id: string[],
        songReference: string,
    ): Promise<IAlbum[]> {
        const albums = await albumSchema
            .find({ _id })
            .where('listSong')
            .equals(songReference);
        return albums;
    }

    public async getById(_id: string): Promise<IAlbum | null> {
        const album = await albumSchema.findById(_id);
        return album;
    }

    public async getByIdPopulate(_id: string): Promise<IAlbum | null> {
        const album = await albumSchema.findById(_id)
        .populate({
            path: "listSong",
            strictPopulate: true,
            select: 'title thumbnailUrl publish performers',
            populate: ({
                path: "performers",
                strictPopulate: true,
                select: 'name nickname'
            })
        }) .populate({
            path: "userReference",
            strictPopulate: true,
            select: 'name avatarUrl songsReference',
            populate: ({
                path: "songsReference",
                strictPopulate: true,
                select: 'title'
            })
        });
        return album;
    }

    public async search(title: string): Promise<IAlbum[]> {
        const albumQuery = albumSchema.find({
            $or: [
                { title: { $regex: title, $options: 'i' } }
            ]
        }).select('title thumbnailUrl')
        return albumQuery;
    }

    public async create(payload: IAlbum): Promise<IAlbum> {
        const created = await albumSchema.create(payload);
        return created;
    }

    public async updateManyActionSongReference(
        _id: string[],
        songReference: string,
        options: EnumActionUpdate,
    ): Promise<UpdateWriteOpResult> {
        switch (options) {
            case EnumActionUpdate.REMOVE:
                const removeUpdated = await albumSchema.updateMany(
                    {
                        _id: { $in: _id },
                    },
                    {
                        $pull: { listSong: { $in: songReference } },
                    },
                );
                return removeUpdated;
            case EnumActionUpdate.PUSH:
                const pushUpdated = await albumSchema.updateMany(
                    {
                        _id: { $in: _id },
                    },
                    {
                        $push: { listSong: songReference },
                    },
                );
                return pushUpdated;
            default:
                throw new Error('INVALID ACTION TYPE UPDATE');
        }
    }

    public async updatedField(
        id: string,
        payload: Partial<Omit<IAlbum, '_id'>>,
    ): Promise<IAlbum | null> {
        const updatedField = await albumSchema.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: payload.title,
                    publish: payload.publish,
                    information: payload.information,
                    userReference: payload.userReference,
                    thumbnail: payload.thumbnail,
                    thumbnailUrl: payload.thumbnailUrl,
                    updatedAt: payload.updatedAt,
                    listSong: payload.listSong,
                },
            },
            { new: true },
        );
        return updatedField;
    }

    public async updatedFieldByActionRemove(
        id: string,
        payload: Partial<Omit<IAlbum, '_id'>>,
    ): Promise<IAlbum | null> {
        const updatedField = await albumSchema.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: payload.title,
                    publish: payload.publish,
                    information: payload.information,
                    userReference: payload.userReference,
                    thumbnail: payload.thumbnail,
                    thumbnailUrl: payload.thumbnailUrl,
                    updatedAt: payload.updatedAt,
                },
                $pull: { listSong: payload.listSong },
            },
            { new: true },
        );
        return updatedField;
    }

    public async updateMultiAlbumListSong(
        listId: string,
        songId: string,
    ): Promise<any> {
        // return await albumSchema.find({ _id: listId }, {  })
    }

    public async updateDetachListSong(
        songReference: string,
    ): Promise<UpdateWriteOpResult> {
        return await albumSchema.updateMany(
            {
                $pull: { listSong: songReference },
            },
            { new: true },
        );
    }

    public async getAlbumNewWeek(item: number): Promise<IAlbum[]> {
        const albumNew = await albumSchema
            .find({
                updatedAt: {
                    $gte: new Date(
                        new Date().setDate(new Date().getDate() - 7),
                    ),
                },
            }).limit(item)
            .populate({
                path: 'userReference',
                strictPopulate: true,
                select: 'name nickname avatar',
            });
        return albumNew;
    }
}
