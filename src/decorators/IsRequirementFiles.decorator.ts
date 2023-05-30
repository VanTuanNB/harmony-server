import handleDeleteFile from '@/helpers/deleteFile.helper';
import { NextFunction, Request, Response } from 'express';
import { IFieldNameFiles } from '@/constraints/interfaces/index.interface';
export default function IsRequirementFiles(fields: string[]) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const [req, res, next] = args as [
                req: Request,
                res: Response,
                next: NextFunction,
            ];
            const files = req.files as IFieldNameFiles;
            const firstCondition = fields.every(
                (file) => Object.keys(files).indexOf(file) !== -1,
            );
            if (firstCondition) {
                return originalMethod.apply(this, args);
            } else {
                const keyArray = Object.keys(files);
                keyArray.forEach((key) => {
                    const file = files[key as keyof IFieldNameFiles];
                    handleDeleteFile(file[0]);
                });
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_UPLOAD_FILE',
                });
            }
        };
        return descriptor;
    };
}
