import { config } from 'dotenv';
import IUser from '@/constraints/interfaces/IUser';
import jwt from 'jsonwebtoken';
config();

export function generateToken(payload: Pick<IUser, '_id' | 'email'>): {
    accessToken: string;
    refreshToken: string;
} {
    const accessToken = jwt.sign(
        payload,
        process.env.SECRET_ACCESS_TOKEN as string,
        {
            expiresIn: '3days',
        },
    );
    const refreshToken = jwt.sign(
        payload,
        process.env.SECRET_REFRESH_TOKEN as string,
        {
            expiresIn: '30days',
        },
    );

    return {
        accessToken,
        refreshToken,
    };
}

export function verifyToken(
    token: string,
    secretKey: string,
): string | jwt.JwtPayload {
    const isValid = jwt.verify(token, secretKey);
    return isValid;
}
