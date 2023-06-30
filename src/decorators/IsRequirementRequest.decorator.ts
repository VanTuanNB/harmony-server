import { NextFunction, Request, Response } from 'express';

import { regexEmail, regexUuidV4Validation } from '@/utils/regex.util';
import handleDeleteFile from '@/helpers/deleteFile.helper';
import { IFieldNameFiles } from '@/constraints/interfaces/index.interface';

type TypeRequest = 'body' | 'query' | 'params';

function handleDeletedFileInDecorator(files: IFieldNameFiles) {
    if (Object.keys(files).length > 0) {
        for (const keyFile in files) {
            handleDeleteFile(files[keyFile][0]);
        }
    }
}

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
                switch (typeof key) {
                    case 'string':
                        console.log(payload[key]);
                        const condition = regexUuidV4Validation(
                            payload[key] as string,
                        );
                        if (req.files && !condition)
                            handleDeletedFileInDecorator(
                                req.files as IFieldNameFiles,
                            );
                        console.log(`condition string: `, condition);
                        return condition
                            ? originalMethod.apply(this, args)
                            : res.status(400).json({
                                  status: 400,
                                  success: false,
                                  message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                              });
                    case 'object':
                        const mapping: string[] = [];
                        Object.entries(payload).forEach(([keyId, value]) => {
                            if (key.indexOf(keyId) !== -1) {
                                if (
                                    typeof value === 'string' &&
                                    value.trim().startsWith(`[`)
                                ) {
                                    const parseFormDataStringId = JSON.parse(
                                        value,
                                    ) as string[];
                                    parseFormDataStringId.forEach(
                                        (id: string) => {
                                            mapping.push(id.trim());
                                        },
                                    );
                                } else if (Array.isArray(value)) {
                                    value.forEach((id: string) =>
                                        mapping.push(id.trim()),
                                    );
                                } else {
                                    mapping.push(value.trim());
                                }
                            }
                        });
                        const isPassed = mapping.every((currentValue: string) =>
                            regexUuidV4Validation(currentValue),
                        );
                        if (req.files && !isPassed)
                            handleDeletedFileInDecorator(
                                req.files as IFieldNameFiles,
                            );
                        return isPassed
                            ? originalMethod.apply(this, args)
                            : res.status(400).json({
                                  status: 400,
                                  success: false,
                                  message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                              });
                    default:
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                        });
                }
            } catch (error) {
                console.log(error);
                if (req.files)
                    handleDeletedFileInDecorator(req.files as IFieldNameFiles);
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
                switch (typeof key) {
                    case 'string':
                        const condition = key in payload && !!payload[key];
                        return condition
                            ? originalMethod.apply(this, args)
                            : res.status(400).json({
                                  status: 400,
                                  success: false,
                                  message: `BAD_REQUEST_REQUIRE_NOT_NULL_"${key}"`,
                              });
                    case 'object':
                        const isPassed = key.every(
                            (currentValue: string) =>
                                currentValue in payload &&
                                !!payload[currentValue],
                        );
                        return isPassed
                            ? originalMethod.apply(this, args)
                            : res.status(400).json({
                                  status: 400,
                                  success: false,
                                  message: `BAD_REQUEST_REQUIRE_NOT_NULL_"${key}"`,
                              });

                    default:
                        return res.status(400).json({
                            status: 400,
                            success: false,
                            message: `BAD_REQUEST_REQUIRE_NOT_NULL_"${key}"`,
                        });
                }
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
