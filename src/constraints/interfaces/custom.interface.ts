import { Request } from 'express';
export interface CustomResponse<T = any> {
    status: number;
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export interface CustomRequest extends Request {}
