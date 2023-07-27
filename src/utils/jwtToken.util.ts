import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { IPayloadToken } from '@/constraints/interfaces/index.interface';
config();

export function generateToken(payload: Omit<IPayloadToken, 'iat' | 'exp'>): {
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
