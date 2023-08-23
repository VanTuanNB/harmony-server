import { Response } from 'express';

import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import { IGenre } from '@/constraints/interfaces/index.interface';
import {
    IsRequirementReq,
    IsRequirementTypeId,
} from '@/decorators/index.decorator';
import { genreService } from '@/instances/index.instance';

export default class GenreController {
    public async getGenreTopListSong(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const genres = await genreService.getTopListSong()
        return res.status(genres.status).json(genres);
    }
    @IsRequirementReq('title', 'body')
    public async create(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<IGenre, 'title'> = req.body;
        const genreCreateService = await genreService.create(payload);
        return res.status(genreCreateService.status).json(genreCreateService);
    }

    public async getAll(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const genres = await genreService.getAll();
        return res.status(genres.status).json(genres);
    }

    @IsRequirementReq('item', 'query')
    public async getGenreTop(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const item = req.query.item as string
        const genres = await genreService.getTop4Item(parseInt(item));
        return res.status(genres.status).json(genres);
    }

    @IsRequirementReq('id', 'params')
    public async getById(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const {id} = req.params
        console.log(id);
        const genres = await genreService.getById(id)
        return res.status(genres.status).json(genres);
    }

    @IsRequirementTypeId('id', 'params')
    public async update(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const _id: string = req.params.id;
        const payload: Omit<IGenre, '_id'> = req.body;
        const genres = await genreService.updateById(_id, payload);
        return res.status(genres.status).json(genres);
    }
}
