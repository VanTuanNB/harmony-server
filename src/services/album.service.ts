import { v4 as uuidv4 } from 'uuid';

import IAlbum from '@/constraints/interfaces/IAlbum';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import AlbumModel from '@/models/album.model';
import ComposerModel from '@/models/composer.model';
import ComposerService from './composer.service';

export default class AlbumService {
    public static async create(
        payload: Pick<IAlbum, 'title' | 'publish' | 'composerReference'>,
    ): Promise<CustomResponse> {
        try {
            const _id: string = uuidv4();
            const composer = await ComposerModel.getById(
                payload.composerReference,
            );
            if (!composer)
                return {
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_COMPOSER_NOT_FOUND',
                };
            const albumByComposer = await AlbumModel.getByComposerAndTitle(
                payload.composerReference,
                payload.title,
            );
            if (albumByComposer)
                return {
                    status: 400,
                    success: false,
                    message: 'TITLE_ALBUM_IS_EXISTING',
                };

            const newAlbum = await AlbumModel.create({
                _id,
                ...payload,
            });
            await ComposerService.updateFieldGenre(
                payload.composerReference,
                newAlbum._id,
            );
            return {
                status: 201,
                success: true,
                message: 'POST_ALBUM_SUCCESSFULLY',
                data: newAlbum,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_ALBUM_FAILED',
                errors: error,
            };
        }
    }
    public static async updateMultipleCollection(
        listIdAlbum: string[],
        songId: string,
    ): Promise<boolean> {
        try {
            listIdAlbum.forEach(async (id: string) => {
                await AlbumModel.updatedField(id, {
                    listSong: [songId],
                });
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}
