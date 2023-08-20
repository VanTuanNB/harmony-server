import { NextFunction, Request, Response } from 'express';

import { regexEmail, regexUuidV4Validation } from '@/utils/regex.util';

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
                const payload: { [x: string]: any } = req[scope];
                switch (typeof key) {
                    case 'string':
                        const condition = regexUuidV4Validation(
                            payload[key] as string,
                        );
                        return condition
                            ? originalMethod.apply(this, args)
                            : res.status(400).json({
                                  status: 400,
                                  success: false,
                                  message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                              });
                    case 'object':
                        const mapping: string[] = [];
                        let flagInValidArray: boolean[] = [];
                        const reducePayload = Object.entries(payload).reduce(
                            (acc: { [key: string]: string }, cur, index) => {
                                const [keyId, value] = cur;
                                if (key.indexOf(keyId) !== -1) {
                                    acc[keyId] = value;
                                    flagInValidArray.push(
                                        Array.isArray(value)
                                            ? value.length > 0
                                            : !!value,
                                    );
                                }
                                return acc;
                            },
                            {},
                        );
                        if (flagInValidArray.includes(false))
                            return res.status(400).json({
                                status: 400,
                                success: false,
                                message: 'BAD_REQUEST_REQUIRE_ID_TYPE',
                            });
                        Object.entries(reducePayload).forEach(
                            ([keyId, value]: [
                                keyId: string,
                                value: string | string[],
                            ]) => {
                                if (key.indexOf(keyId) !== -1) {
                                    if (
                                        typeof value === 'string' &&
                                        value.trim().startsWith(`[`)
                                    ) {
                                        const parseFormDataStringId =
                                            JSON.parse(value) as string[];
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
                            },
                        );
                        const isPassed = mapping.every((currentValue: string) =>
                            regexUuidV4Validation(currentValue),
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
                const payload: { [x: string]: any } = req[scope];
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
