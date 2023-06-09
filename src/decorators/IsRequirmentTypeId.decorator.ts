import { NextFunction, Request, Response } from 'express';
import regexUuidV4Validation from '@/utils/regexUuidv4.util';
import handleDeleteFile from '@/helpers/deleteFile.helper';
import IFieldNameFiles from '@/constraints/interfaces/IFieldNameFiles';

type TypeRequest = 'body' | 'query' | 'params';

export default function IsRequirementTypeId(
    key: string | string[],
    scope: TypeRequest,
) {
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
            try {
                let payload: { [x: string]: any } = req.body;
                switch (scope) {
                    case 'body':
                        payload = req.body;
                        break;
                    case 'params':
                        payload = req.params;
                        break;
                    case 'query':
                        payload = req.query;
                        break;
                    default:
                        throw new Error('Required type request');
                }
                if (typeof key === 'string') {
                    if (regexUuidV4Validation(payload[key] as string)) {
                        return originalMethod.apply(this, args);
                    }
                } else {
                    const mapping: string[] = [];
                    Object.entries(payload).forEach(([keyId, value]) => {
                        if (key.indexOf(keyId) !== -1) {
                            mapping.push(value.trim());
                        }
                    });
                    const isPassed = mapping.every((currentValue: string) =>
                        regexUuidV4Validation(currentValue),
                    );
                    if (isPassed) {
                        const result = originalMethod.apply(this, args);
                        return result;
                    }
                }
                const files = req.files as IFieldNameFiles;
                if (Object.keys(files).length > 0) {
                    for (const keyFile in files) {
                        handleDeleteFile(files[keyFile][0]);
                    }
                }
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                });
            }
        };

        return descriptor;
    };
}
