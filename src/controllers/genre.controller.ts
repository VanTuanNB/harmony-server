import { Response } from 'express';

import IGenre from '@/constraints/interfaces/IGenre';
import { CustomRequest } from '@/constraints/interfaces/custom.interface';
import IsRequirementReq from '@/decorators/IsRequirementReq.decorator';
import GenreService from '@/services/genre.service';

export default class GenreController {
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
