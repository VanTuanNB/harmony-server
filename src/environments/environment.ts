import { IEnvironment } from '@/constraints/interfaces/common.interface';
import { config } from 'dotenv';
config();
function handleEnvironment(): IEnvironment {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        ORIGIN: isProduction
            ? 'https://harmony-psi.vercel.app/'
            : 'http://localhost:5000',
        PREFIX: 'api',
        VERSION: 'v1',
        CLIENT_URL: isProduction
            ? 'https://harmony-psi.vercel.app/'
            : 'http://localhost:3000/',
        IS_PRODUCTION: isProduction,
        DOMAIN_CLIENT: isProduction ? 'harmony-psi.vercel.app' : 'localhost',
    };
}

export const environment: IEnvironment = handleEnvironment();
