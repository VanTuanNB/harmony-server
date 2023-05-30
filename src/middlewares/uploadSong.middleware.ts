import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';
import upload from '@/utils/multer.util';

export function uploadSong(req: Request, res: Response, next: NextFunction) {
    const handleErroring = upload.fields([
        {
            name: uploadFiledEnum.Thumbnail,
            maxCount: 1,
        },
        { name: uploadFiledEnum.FileSong, maxCount: 1 },
    ]);
    return handleErroring(req, res, function (err: unknown) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: `The field name is invalid ${req.file?.fieldname}`,
                error: err,
            });
        } else if (err) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: `The field name is invalid ${req.file?.fieldname}`,
                error: err,
            });
        }
        next();
    });
}
