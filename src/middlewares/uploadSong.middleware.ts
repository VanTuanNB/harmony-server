import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';
import upload from '@/utils/multer.util';
import { IFieldNameFiles } from '@/constraints/interfaces/index.interface';
import handleDeleteFile from '@/helpers/deleteFile.helper';

export function uploadSong(req: Request, res: Response, next: NextFunction) {
    const handleErroring = upload.fields([
        {
            name: uploadFiledEnum.Thumbnail,
            maxCount: 1,
        },
        { name: uploadFiledEnum.FileSong, maxCount: 1 },
    ]);
    return handleErroring(req, res, function (err: unknown) {
        const files = req.files as IFieldNameFiles;
        if (err instanceof multer.MulterError) {
            console.log(err);
            Object.keys(files).forEach((key: string) => {
                handleDeleteFile(files[key][0]);
            });
            return res.status(400).json({
                status: 400,
                success: false,
                message: `BAD_REQUEST_UPLOAD_FILE_NOT_EXITS_FIELDNAME_OR_INVALID_TYPE`,
                error: err,
            });
        } else if (err) {
            console.log(err);
            Object.keys(files).forEach((key: string) => {
                handleDeleteFile(files[key][0]);
            });
            return res.status(400).json({
                status: 400,
                success: false,
                message: `BAD_REQUEST_UPLOAD_FILE_NOT_EXITS_FIELDNAME_OR_INVALID_TYPE`,
                error: err,
            });
        }
        next();
    });
}
