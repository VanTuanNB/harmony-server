import { v4 as uuidv4 } from 'uuid';

import IUser from '@/constraints/interfaces/IUser';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import UserModel from '@/models/user.model';
import ComposerModel from '@/models/composer.model';

export default class ComposerService {
    public static async create(
        payload: Pick<IUser, '_id'>,
    ): Promise<CustomResponse> {
        try {
            const user = await UserModel.getById(payload._id);
            if (!user)
                return {
                    status: 400,
                    success: false,
                    message: 'USER_NOT_EXIST',
                };
            const _id: string = uuidv4();
            const randomEntryPointSlug = Math.floor(Math.random() * 1000);
            const nickname =
                (user.name
                    .normalize('NFD')
                    .replace(/[^a-z0-9\s]/gi, '')
                    .toLocaleLowerCase()
                    .replace(/\s+/g, '') ?? '') +
                (randomEntryPointSlug < 1000
                    ? randomEntryPointSlug * 10
                    : randomEntryPointSlug);
            const createdComposer = await ComposerModel.create({
                _id,
                name: user.name,
                nickname,
                avatar: user.avatar ?? undefined,
                country: user.locale,
            });
            await UserModel.updateById(user._id, {
                composerReference: createdComposer._id,
            });

            return {
                status: 201,
                success: true,
                message: 'POST_COMPOSER_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_COMPOSER_FAILED',
                errors: error,
            };
        }
    }
    public static async updateFieldGenre(
        id: string,
        genreId: string,
    ): Promise<boolean> {
        try {
            await ComposerModel.updatedField(id, {
                albumsReference: [genreId],
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
