import cors from 'cors';
import { config } from 'dotenv';
import express, { Express } from 'express';

import morgan from 'morgan';

import rootRouter from '@/routes/index.route';
import cookieParser from 'cookie-parser';
import Database from './database/connect.db';

config();
const ORIGIN_SERVER =
    process.env.NODE_ENV === 'production'
        ? process.env.PORT_SERVER_PRODUCTION
        : `${process.env.SERVER_URL}:${process.env.PORT_SERVER || 5000}`;

const app: Express = express();
// use global middleware
const whitelist = ['http://localhost:3000', 'http://localhost:5173'];
app.use(
    cors((req, callback) => {
        const corsOptions = { origin: false };
        if (whitelist.indexOf(req.header('Origin') ?? '') !== -1) {
            corsOptions.origin = true;
        } else {
            corsOptions.origin = false;
        }
        callback(null, {
            ...corsOptions,
            methods: [
                'GET',
                'HEAD',
                'POST',
                'PATCH',
                'PUT',
                'DELETE',
                'OPTIONS',
            ],
            credentials: true,
        });
    }),
);
app.use(morgan('dev'));
app.use(cookieParser()); // process.env.COOKIE_SECRET
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// connect Database
Database.connect();

app.use(`/api/${process.env.CURRENT_API_VERSION as string}`, rootRouter);

app.listen(process.env.PORT_SERVER || 5000, () =>
    console.log(`App listening on port ${ORIGIN_SERVER}`),
);

export default app;
