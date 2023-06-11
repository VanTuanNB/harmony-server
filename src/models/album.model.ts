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
    public static async create(payload: IAlbum): Promise<IAlbum> {
        const created = await albumSchema.create(payload);
        return created;
    }

    public static async updatedField(
        id: string,
        payload: Partial<Omit<IAlbum, '_id'>>,
    ): Promise<IAlbum | null> {
        const updatedField = await albumSchema.findByIdAndUpdate(id, {
            $set: {
                title: payload.title,
                publish: payload.publish,
                information: payload.information,
                composerReference: payload.composerReference,
                updatedAt: payload.updatedAt,
            },
            $push: { listSong: payload.listSong },
        });
        return updatedField;
    }
}
