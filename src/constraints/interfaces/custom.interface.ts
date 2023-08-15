import { Request, Response } from 'express';
import { IPayloadToken } from './common.interface';
export interface CustomResponse<T = any> {
    status: number;
    success: boolean;
    message: string;
    data?: T;
    paging?: {
        page: number;
        size: number;
        totalItems: number;
        totalPages: number;
    };
    errors?: unknown;
}

export interface CustomRequest extends Request {}
export interface CustomResponseExpress extends Response {
    locals: {
        memberDecoded?: IPayloadToken;
    };
}
