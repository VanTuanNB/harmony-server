import IComposer from '@/constraints/interfaces/IComposer';
import composerSchema from '@/database/schemas/composer.schema';

export default class ComposerModel {
    public static async getComposerByUserId(
        id: string,
    ): Promise<IComposer | null> {
        const composer = await composerSchema.findOne({ userReference: id });
        return composer;
    }
    public static async getById(_id: string): Promise<IComposer | null> {
        const composer = await composerSchema.findById(_id);
        return composer;
    }
    public static async getListSong(_id: string): Promise<IComposer | null> {
        const listSongOfComposer = await composerSchema.findById(_id).populate({
            path: 'songsReference',
            strictPopulate: true,
            select: 'title',
        });
        return listSongOfComposer;
    }

    public static async getMultipleById(_id: string[]): Promise<IComposer[]> {
        const composers = await composerSchema.find({ _id });
        return composers;
    }

    public static async create(payload: IComposer): Promise<IComposer> {
        const created = await composerSchema.create(payload);
        return created;
    }

    public static async updatedField(
        id: string,
        payload: Partial<Omit<IComposer, '_id'>>,
    ): Promise<IComposer | null> {
        const updated = await composerSchema.findByIdAndUpdate(id, {
            $set: {
                name: payload.name,
                avatar: payload.avatar,
                nickname: payload.nickname,
                country: payload.country,
            },
            $push: {
                songsReference: payload.songsReference,
                albumsReference: payload.albumsReference,
            },
        });
        return updated;
    }
}
