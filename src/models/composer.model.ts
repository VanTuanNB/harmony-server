import IComposer from '@/constraints/interfaces/IComposer';
import composerSchema from '@/database/schemas/composer.schema';

export default class ComposerModel {
    public static async create(payload: IComposer): Promise<IComposer> {
        const created = await composerSchema.create(payload);
        return created;
    }
}
