import { UpdateWriteOpResult } from 'mongoose';

import { EnumActionUpdate } from '@/constraints/enums/action.enum';
import IAlbum from '@/constraints/interfaces/IAlbum';
import albumSchema from '@/database/schemas/album.schema';

export default class AlbumModel {
    public static async getByComposerAndTitle(
        idComposer: string,
        title: string,
    ): Promise<IAlbum | null> {
        const albumByComposer = await albumSchema.findOne({
            composerReference: idComposer,
            title: { $regex: title, $options: 'i' },
        });
        return albumByComposer;
    }

    public static async getBySongReference(
        _id: string,
        songReference: string,
    ): Promise<IAlbum | null> {
        const album = await albumSchema.findOne({
            _id,
            listSong: songReference,
        });
        return album;
    }

    public static async getMultipleBySongReference(
        _id: string[],
        songReference: string,
    ): Promise<IAlbum[]> {
        const albums = await albumSchema
            .find({ _id })
            .where('listSong')
            .equals(songReference);
        return albums;
    }

    public static async getById(_id: string): Promise<IAlbum | null> {
        const album = await albumSchema.findById(_id).populate({
            path: 'composerReference',
            strictPopulate: true,
            select: 'name nickname'
        })
            .populate({
                path: 'listSong',
                strictPopulate: true,
                select: 'title thumbnail'
            });
        return album;
    }

    public static async search(title: string): Promise<IAlbum[]> {
        const albumQuery = albumSchema.find({
            $or: [
                { title: { $regex: title, $options: 'i' } }
            ]
        }).populate({
            path: 'composerReference',
            strictPopulate: true,
            select: 'name nickname'
        });
        return albumQuery;
    }

    public static async create(payload: IAlbum): Promise<IAlbum> {
        const created = await albumSchema.create(payload);
        return created;
    }

    public static async updateManyActionSongReference(
        _id: string[],
        songReference: string,
        options: EnumActionUpdate,
    ): Promise<UpdateWriteOpResult> {
        switch (options) {
            case EnumActionUpdate.REMOVE:
                const removeUpdated = await albumSchema
                    .find({ _id })
                    .updateMany({
                        $pull: { listSong: songReference },
                    });
                return removeUpdated;
            case EnumActionUpdate.PUSH:
                const pushUpdated = await albumSchema.find({ _id }).updateMany({
                    $push: { listSong: songReference },
                });
                return pushUpdated;
            default:
                throw new Error('INVALID ACTION TYPE UPDATE');
        }
    }

    public static async updatedField(
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
                    composerReference: payload.composerReference,
                    updatedAt: payload.updatedAt,
                },
                $push: { listSong: payload.listSong },
            },
            { new: true },
        );
        return updatedField;
    }

    public static async updatedFieldByActionRemove(
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
                    composerReference: payload.composerReference,
                    updatedAt: payload.updatedAt,
                },
                $pull: { listSong: payload.listSong },
            },
            { new: true },
        );
        return updatedField;
    }

    public static async getAlbumNewWeek(): Promise<IAlbum[]> {
        const albumNew = await albumSchema.find({
            updatedAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }).populate({
            path: 'composerReference',
            strictPopulate: true,
            select: 'name nickname avatar'
        });
        return albumNew;
    }
}
