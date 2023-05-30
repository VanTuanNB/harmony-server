import { Response } from 'express';

import {
    CustomRequest,
    ISong,
    IFieldNameFiles,
} from '@/constraints/interfaces/index.interface';
import IsRequirementFiles from '@/decorators/IsRequirementFiles.decorator';
import IsRequirementReq from '@/decorators/IsRequirementReq.decorator';
import SongService from '@/services/song.service';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';

export default class SongController {
    @IsRequirementReq(['title'], 'body')
    @IsRequirementFiles([uploadFiledEnum.FileSong, uploadFiledEnum.Thumbnail])
    public static async create(
        req: CustomRequest,
        res: Response,
    ): Promise<Response | void> {
        const payload: Pick<ISong, 'title' | 'publish'> = req.body;
        const { thumbnail, fileSong } = req.files as IFieldNameFiles;
        const createSong = await SongService.create(
            {
                thumbnail: thumbnail[0],
                fileSong: fileSong[0],
            },
            payload,
        );
        // return res.status(createSong.status).json(createSong);
        return res.status(201).json({ message: 'testing api create song' });
    }
}
