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
import { songService } from '@/instances/index.instance';

const requirementFields = [
    'title',
    'uploadId',
    'publish',
    'genresReference',
    'performers',
];
export default class SongController {
    constructor() {}
    public async getAll(req: Request, res: Response): Promise<Response | void> {
        const songs = await songService.getAll();
        return res.status(songs.status).json(songs);
    }

    @IsRequirementTypeId('id', 'params')
    public async getById(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id = req.params.id;
        const song = await songService.getById(_id);
        return res.status(song.status).json(song);
    }

    @IsRequirementReq('id', 'params')
    public async getStreamSong(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const { id } = req.params;
        const range = req.headers.range;
        const getStreamSongService = await songService.getStreamSong(id, range);
        if (!getStreamSongService.success)
            return res
                .status(getStreamSongService.status)
                .json(getStreamSongService);
        const { data } = getStreamSongService;
        const streamData =
            data &&
            data.instanceContent &&
            (data.instanceContent.Body as Readable);
        if (streamData) {
            res.writeHead(getStreamSongService.status, {
                ...data?.resHeader,
            });
            streamData.pipe(res);
        } else {
            delete getStreamSongService.data;
            return res
                .status(getStreamSongService.status)
                .json(getStreamSongService);
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
        const createSongService = await songService.create(payload);
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
        const updateSongService = await songService.update(id, payload);
        return res.status(updateSongService.status).json(updateSongService);
    }

    @IsRequirementReq('id', 'params')
    public async forceDelete(
        req: CustomRequest,
        res: CustomResponseExpress,
    ): Promise<Response | void> {
        const { id } = req.params;
        const userId = res.locals.memberDecoded?._id;
        const forceDeleteSongService = await songService.forceDelete(
            id,
            userId ?? '',
        );
        return res
            .status(forceDeleteSongService.status)
            .json(forceDeleteSongService);
    }
}
