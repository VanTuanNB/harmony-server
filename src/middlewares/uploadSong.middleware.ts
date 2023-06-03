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
            console.log(err);
            return res.status(400).json({
                status: 400,
                success: false,
                message: `BAD_REQUEST_UPLOAD_FILE_NOT_EXITS_FIELDNAME_OR_INVALID_TYPE`,
                error: JSON.stringify(err),
            });
        } else if (err) {
            console.log(err);
            return res.status(400).json({
                status: 400,
                success: false,
                message: `BAD_REQUEST_UPLOAD_FILE_NOT_EXITS_FIELDNAME_OR_INVALID_TYPE`,
                error: JSON.stringify(err),
            });
        }
        next();
    });
}

// ngày mai code phần tạo api service nữa là done task
