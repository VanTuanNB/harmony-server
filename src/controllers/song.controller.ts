import { Request, Response } from 'express';

import { CustomRequest, ISong } from '@/constraints/interfaces/index.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/index.decorator';

import { CustomResponseExpress } from '@/constraints/interfaces/custom.interface';
import { songService } from '@/instances/index.instance';
import { Readable } from 'stream';

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


    @IsRequirementReq('item', 'query')
    public async getSongJustReleased(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const item = req.query.item as string
        const songs = await songService.getJustReleased(parseInt(item));
        return res.status(songs.status).json(songs);
    }

    @IsRequirementReq('item', 'query')
    public async getSongTop(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const item = req.query.item as string;
        const song = await songService.getTopView(parseInt(item));
        return res.status(song.status).json(song);
    }

    public async suggest(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const { page, size } = req.query as {
            page?: string;
            size?: string;
        };
        const suggestService = await songService.suggest(
            Number.parseInt(page || '1'),
            Number.parseInt(size || '10'),
        );
        return res.status(suggestService.status).json(suggestService);
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

    
    @IsRequirementReq('title', 'query')
    public async search(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const title = req.query.title as string
        const song = await songService.search(title);
        return res.status(song.status).json(song);
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
        > & { isNewUploadAvatar?: boolean } = req.body;
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

    @IsRequirementTypeId('id', 'params')
    public async increaseView(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const _id: string = req.params.id;
        const increaseService = await songService.increaseViewQueue(_id);
        return res.status(increaseService.status).json(increaseService);
    }
}
