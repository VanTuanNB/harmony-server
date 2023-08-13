import cors from 'cors';
import { config } from 'dotenv';
import express, { Express } from 'express';
import 'module-alias/register';
import morgan from 'morgan';

import rootRouter from '@/routes/index.route';
import Database from './database/connect.db';

config();
const PORT_SERVER = process.env.PORT_SERVER || 5000;

const app: Express = express();
// use global middleware
const whitelist = ['http://localhost:3000'];
app.use(
    cors((req, callback) => {
        const corsOptions = { origin: false };
        if (whitelist.indexOf(req.header('Origin') ?? '') !== -1) {
            corsOptions.origin = true;
        } else {
            corsOptions.origin = false;
        }
        callback(null, corsOptions);
    }),
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// connect Database
Database.connect();

app.use(`/api/${process.env.CURRENT_API_VERSION as string}`, rootRouter);

app.listen(PORT_SERVER, () =>
    console.log(`App listening on port http://localhost:${PORT_SERVER}`),
);
