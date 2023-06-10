
import { NextFunction, Response, Request } from 'express';


import {
    CustomRequest,
    ISong,
    IFieldNameFiles,
} from '@/constraints/interfaces/index.interface';
import {
    IsRequirementFiles,
    IsRequirementTypeId,
    IsRequirementReq,
} from '@/decorators/index.decorator';

import SongService from '@/services/song.service';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';

const requirementFields = [
    'title',
    'composerReference',
    'publish',
    'genresReference',
    'performers',
];
export default class SongController {
    public static async getAll(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const songs = await SongService.getAll();
        return res.status(songs.status).json(songs);
    }
    @IsRequirementReq('id', 'params')
    public static async getById(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const _id = req.params.id;
        const song = await SongService.getById(_id);
        return res.status(song.status).json(song);
    }
    @IsRequirementReq(requirementFields, 'body')
    @IsRequirementTypeId(
        [
            'composerReference',
            'genresReference',
            'albumReference',
            'performers',
        ],
        'body',
    )
    @IsRequirementFiles([uploadFiledEnum.FileSong, uploadFiledEnum.Thumbnail])
    public static async middlewareCreateSong(
        req: CustomRequest,
        res: Response,
        next: NextFunction,
    ): Promise<Response | void> {
        const { title, composerReference } = req.body;
        const { thumbnail, fileSong } = req.files as IFieldNameFiles;
        const validate = await SongService.validateTitleUploadSong(
            title,
            composerReference,
            {
                fileSong: fileSong[0],
                thumbnail: thumbnail[0],
            },
        );
        if (validate.success) {
            return next();
        }
        return res.status(validate.status).json(validate);
    }

    public static async create(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<
            ISong,
            | 'title'
            | 'publish'
            | 'albumReference'
            | 'composerReference'
            | 'genresReference'
            | 'performers'
        > = {
            ...req.body,
        };
        const { thumbnail, fileSong } = req.files as IFieldNameFiles;
        const createSong = await SongService.create(
            {
                thumbnail: thumbnail[0],
                fileSong: fileSong[0],
            },
            payload,
        );
        return res.status(createSong.status).json(createSong);
    }
}
