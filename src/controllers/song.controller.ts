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
import { CustomResponseExpress } from '@/constraints/interfaces/custom.interface';

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

    @IsRequirementTypeId('id', 'params')
    public static async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const song = await SongService.getById(_id);
        return res.status(song.status).json(song);
    }

    @IsRequirementReq('id', 'params')
    public static async search(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const title = req.params.id
        const song = await SongService.search(title);
        return res.status(song.status).json(song);
    }


    @IsRequirementTypeId('id', 'params')
    public static async getStreamSong(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const { id } = req.params;
        const range = req.headers.range;
        const songService = await SongService.getFsStreamSong(id, range);
        if (!songService.success)
            return res.status(songService.status).json(songService);
        res.writeHead(songService.status, {
            ...songService.data?.resHeader,
        });
        songService.data?.fileStream.pipe(res);
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

    public static async middlewareUpdateSong(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        console.log(req.files);
        return res.status(400).json({ message: 'TESTING UPDATE' });
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

    @IsRequirementTypeId('id', 'params')
    public static async update(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        if (Object.keys(req.body).length === 0)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'PAYLOAD_IS_EMPTY',
            });
        const { thumbnail, fileSong } = req.files as IFieldNameFiles;
        const updateSongService = await SongService.update(id, {
            ...req.body,
            thumbnail: thumbnail ? thumbnail[0] : undefined,
            fileSong: fileSong ? fileSong[0] : undefined,
        });
        return res.status(updateSongService.status).json(updateSongService);
    }

    @IsRequirementReq('id', 'params')
    public static async delete(
        req: CustomRequest,
        res: CustomResponseExpress,
    ):Promise<Response | void>{
        const { id } = req.params;
        const deleteSong = await SongService.forceDelete(id)
        return res.status(deleteSong.status).json(deleteSong);
    }
}
