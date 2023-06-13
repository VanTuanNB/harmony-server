import { verifyToken } from '@/utils/jwtToken.util';
import { Request, Response, NextFunction } from 'express';

export default async function authenticationUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    try {
        const authentication = req.headers.authorization;
        const bearerToken =
            authentication && authentication.split('Bearer ')[1];
        if (!bearerToken)
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'NO_PROVIDER_BEARER_TOKEN',
            });
        const verify = verifyToken(
            bearerToken,
            process.env.SECRET_ACCESS_TOKEN as string,
        );

        res.locals.userDecoded = verify;
        next();
    } catch (error: any) {
        console.log(error);
        const condition =
            typeof error === 'object' &&
            error.hasOwnProperty('name') &&
            error.hasOwnProperty('message');
        return res.status(500).json({
            status: condition ? 403 : 500,
            success: false,
            message: 'INVALID_TOKEN',
            errors: error,
        });
    }
}
