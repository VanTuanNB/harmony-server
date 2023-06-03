import IComposer from '@/constraints/interfaces/IComposer';
import composerSchema from '@/database/schemas/composer.schema';

export default class ComposerModel {
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
                slug: payload.slug,
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
