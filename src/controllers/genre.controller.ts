import { Response, Request } from 'express';

import { IGenre } from '@/constraints/interfaces/index.interface';
import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import { IsRequirementReq } from '@/decorators/index.decorator';
import GenreService from '@/services/genre.service';

export default class GenreController {
    public static async getAll(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        const genres = await GenreService.getAll();
        return res.status(genres.status).json(genres);
    }
    @IsRequirementReq('title', 'body')
    public static async create(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<IGenre, 'title'> = req.body;
        const genreCreateService = await GenreService.create(payload);
        return res.status(genreCreateService.status).json(genreCreateService);
    }
}
