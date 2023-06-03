import { NextFunction, Request, Response } from 'express';
import regexUuidV4Validation from '@/utils/regexUuidv4.util';

type TypeRequest = 'body' | 'query' | 'params';
export default function IsRequirementReq(
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
