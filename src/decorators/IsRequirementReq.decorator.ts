import { NextFunction, Request, Response } from 'express';

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
            let payload: { [x: string]: any };
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
                message: `BAD_REQUEST_MISSING_KEY`,
            });
        };

        return descriptor;
    };
}
