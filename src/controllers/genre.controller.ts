import { Response } from 'express';

import { IGenre } from '@/constraints/interfaces/index.interface';
import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/index.decorator';
import { genreService } from '@/instances/index.instance';

export default class GenreController {
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
}
