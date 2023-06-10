import { NextFunction, Request, Response } from 'express';

import { regexEmail, regexUuidV4Validation } from '@/utils/regex.util';
import handleDeleteFile from '@/helpers/deleteFile.helper';
import { IFieldNameFiles } from '@/constraints/interfaces/index.interface';

type TypeRequest = 'body' | 'query' | 'params';

export function IsRequirementTypeId(
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

export function IsRequirementReq(key: string | string[], scope: TypeRequest) {
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
                    if (key in payload && !!payload[key]) {
                        const result = originalMethod.apply(this, args);
                        return result;
                    }
                } else {
                    const isPassed = key.every(
                        (currentValue: string) =>
                            currentValue in payload && !!payload[currentValue],
                    );
                    if (isPassed) {
                        const result = originalMethod.apply(this, args);
                        return result;
                    }
                }
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: `BAD_REQUEST_REQUIRE_NOT_NULL_"${key}"`,
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: `BAD_REQUEST_REQUIRE_NOT_NULL_"${key}"`,
                });
            }
        };

        return descriptor;
    };
}

export function IsRequirementFiles(fields: string[]) {
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
            } catch (error) {
                console.log(error);
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

export function IsRequirementEmail(field: string): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = function (
            req: Request,
            res: Response,
            ...args: any[]
        ) {
            const email = req.body[field];
            const trimEmail = email ?? '';
            if (trimEmail && regexEmail(email)) {
                return originalMethod.apply(this, [req, res, ...args]);
            }
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'BAD_REQUEST_FORMAT_EMAIL_INVALID',
            });
        };
    };
}
