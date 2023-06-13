import { Request, Response } from 'express';
export interface CustomResponse<T = any> {
    status: number;
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export interface CustomRequest extends Request {}
export interface CustomResponseExpress extends Response {
    locals: {
        userDecoded?: {
            _id: string;
            email: string;
            iat: number;
            exp: number;
        };
    };
}
