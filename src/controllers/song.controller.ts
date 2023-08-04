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
import { Readable } from 'stream';

const requirementFields = [
    'title',
    'uploadId',
    'publish',
    'genresReference',
    'performers',
];
export default class SongController {
    constructor(private songService: SongService) {}
    public async getAll(req: Request, res: Response): Promise<Response | void> {
        const songs = await this.songService.getAll();
        return res.status(songs.status).json(songs);
    }

    @IsRequirementTypeId('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const song = await this.songService.getById(_id);
        return res.status(song.status).json(song);
    }

    @IsRequirementReq('id', 'params')
    public async getStreamSong(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const { id } = req.params;
        const range = req.headers.range;
        const songService = await this.songService.getStreamSong(id, range);
        if (!songService.success)
            return res.status(songService.status).json(songService);
        const { data } = songService;
        const streamData =
            data &&
            data.instanceContent &&
            (data.instanceContent.Body as Readable);
        console.log('true', streamData);
        if (streamData) {
            res.writeHead(songService.status, {
                ...data?.resHeader,
            });
            streamData.pipe(res);
        } else {
            delete songService.data;
            return res.status(songService.status).json(songService);
        }
    }

    @IsRequirementReq(requirementFields, 'body')
    public async create(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const payload: Pick<
            ISong,
            | 'title'
            | 'publish'
            | 'genresReference'
            | 'performers'
            | 'userReference'
        > & { uploadId: string } = req.body;
        Object.assign(payload, {
            userReference: res.locals.memberDecoded?._id ?? '',
        });
        const createSongService = await this.songService.create(payload);
        return res.status(createSongService.status).json(createSongService);
    }

    @IsRequirementReq('id', 'params')
    public async update(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        if (Object.keys(req.body).length === 0)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'BAD_REQUEST',
            });
        const payload: Pick<
            ISong,
            | 'albumReference'
            | 'genresReference'
            | 'performers'
            | 'publish'
            | 'title'
        > = req.body;
        const updateSongService = await this.songService.update(id, payload);
        return res.status(updateSongService.status).json(updateSongService);
    }

    @IsRequirementReq('id', 'params')
    public async forceDelete(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        const userId = res.locals.memberDecoded?._id;
        const forceDeleteSongService = await this.songService.forceDelete(
            id,
            userId ?? '',
        );
        return res
            .status(forceDeleteSongService.status)
            .json(forceDeleteSongService);
    }

    // @IsRequirementTypeId('id', 'params')
    // public static async getStreamSong(
    //     req: Request,
    //     res: Response,
    // ): Promise<Response | void> {
    //     const { id } = req.params;
    //     const range = req.headers.range;
    //     const songService = await SongService.getFsStreamSong(id, range);
    //     if (!songService.success)
    //         return res.status(songService.status).json(songService);
    //     res.writeHead(songService.status, {
    //         ...songService.data?.resHeader,
    //     });
    //     songService.data?.fileStream.pipe(res);
    // }

    // @IsRequirementReq(requirementFields, 'body')
    // @IsRequirementTypeId(
    //     ['userReference', 'genresReference', 'albumReference', 'performers'],
    //     'body',
    // )
    // @IsRequirementFiles([uploadFiledEnum.FileSong, uploadFiledEnum.Thumbnail])
    // public static async middlewareCreateSong(
    //     req: CustomRequest,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<Response | void> {
    //     const { title, userReference } = req.body;
    //     const { thumbnail, fileSong } = req.files as IFieldNameFiles;
    //     const validate = await SongService.validateTitleUploadSong(
    //         title,
    //         userReference,
    //         {
    //             fileSong: fileSong[0],
    //             thumbnail: thumbnail[0],
    //         },
    //     );
    //     if (validate.success) {
    //         return next();
    //     }
    //     return res.status(validate.status).json(validate);
    // }

    // public static async middlewareUpdateSong(
    //     req: CustomRequest,
    //     res: CustomResponseExpress,
    // ): Promise<Response | void> {
    //     console.log(req.files);
    //     return res.status(400).json({ message: 'TESTING UPDATE' });
    // }

    // public static async create(
    //     req: CustomRequest,
    //     res: Response,
    // ): Promise<Response | void> {
    //     const payload: Pick<
    //         ISong,
    //         | 'title'
    //         | 'publish'
    //         | 'albumReference'
    //         | 'userReference'
    //         | 'genresReference'
    //         | 'performers'
    //     > = {
    //         ...req.body,
    //     };
    //     const { thumbnail, fileSong } = req.files as IFieldNameFiles;
    //     const createSong = await SongService.create(
    //         {
    //             thumbnail: thumbnail[0],
    //             fileSong: fileSong[0],
    //         },
    //         payload,
    //     );
    //     return res.status(createSong.status).json(createSong);
    // }

    // @IsRequirementTypeId('id', 'params')
    // public static async update(
    //     req: CustomRequest,
    //     res: CustomResponseExpress,
    // ): Promise<Response | void> {
    //     const { id } = req.params;
    //     if (Object.keys(req.body).length === 0)
    //         return res.status(400).json({
    //             status: 400,
    //             success: false,
    //             message: 'PAYLOAD_IS_EMPTY',
    //         });
    //     const { thumbnail, fileSong } = req.files as IFieldNameFiles;
    //     const updateSongService = await SongService.update(id, {
    //         ...req.body,
    //         thumbnail: thumbnail ? thumbnail[0] : undefined,
    //         fileSong: fileSong ? fileSong[0] : undefined,
    //     });
    //     return res.status(updateSongService.status).json(updateSongService);
    // }

    // @IsRequirementReq('id', 'params')
    // public static async delete(
    //     req: CustomRequest,
    //     res: CustomResponseExpress,
    // ): Promise<Response | void> {
    //     const { id } = req.params;
    //     const deleteSong = await SongService.forceDelete(id);
    //     return res.status(deleteSong.status).json(deleteSong);
    // }
}
