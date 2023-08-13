import { RoleConstant } from '@/constraints/enums/role.enum';
import { IPayloadToken } from '@/constraints/interfaces/index.interface';
import { adminService, userService } from '@/instances/index.instance';
import { verifyToken } from '@/utils/jwtToken.util';
import { Request, Response, NextFunction } from 'express';

export async function authenticationUser(
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

        res.locals.memberDecoded = verify;
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

export async function authenticationComposer(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    try {
        const authentication = req.headers.authorization;
        const bearerToken =
            authentication && authentication.split('Bearer ')[1];
        if (!bearerToken)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'NO_PROVIDER_BEARER_TOKEN',
            });
        const verify = verifyToken(
            bearerToken,
            process.env.SECRET_ACCESS_TOKEN as string,
        ) as IPayloadToken;
        if (verify.role !== RoleConstant.COMPOSER)
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'PERMISSION_DENIED',
            });
        const user = await userService.getById(verify._id);
        if (
            !user.success &&
            user.data &&
            user.data.role !== RoleConstant.COMPOSER
        )
            return res.status(400).json({
                status: 403,
                success: false,
                message: 'PERMISSION_DENIED',
            });

        res.locals.memberDecoded = verify;
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
            message: 'AUTHENTICATION_COMPOSER_FAILED',
            errors: error,
        });
    }
}

export async function authenticationAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    try {
        const authentication = req.headers.authorization;
        const bearerToken =
            authentication && authentication.split('Bearer ')[1];
        if (!bearerToken)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'NO_PROVIDER_BEARER_TOKEN',
            });
        const verify = verifyToken(
            bearerToken,
            process.env.SECRET_ACCESS_TOKEN as string,
        ) as IPayloadToken;
        if (verify.role !== RoleConstant.ROOT_ADMIN)
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'PERMISSION_DENIED',
            });
        const admin = await adminService.getById(verify._id);
        if (
            !admin.success &&
            admin.data &&
            admin.data.role !== RoleConstant.ROOT_ADMIN
        )
            return res.status(400).json({
                status: 403,
                success: false,
                message: 'PERMISSION_DENIED',
            });

        res.locals.memberDecoded = verify;
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
            message: 'AUTHENTICATION_COMPOSER_FAILED',
            errors: error,
        });
    }
}
