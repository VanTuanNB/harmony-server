require('dotenv').config();
import 'module-alias/register';
import path from 'path';
import fs from 'fs';

import Database from '@/database/connect.db';

export default class GenreMigration {
    public static async create(): Promise<boolean> {
        try {
            const db = await Database.connect();
            const filePath = path.join(
                __dirname,
                '../',
                'database',
                'backups',
                'genres.json',
            );
            const fileContent = fs.readFileSync(filePath, {
                encoding: 'utf-8',
            });
            const fileData = JSON.parse(fileContent);
            const collectionName = 'genres';
            const isExits = !!(await db
                .listCollections({ name: collectionName })
                .next());
            if (isExits) db.collection(collectionName).drop();
            const result = await db
                .collection(collectionName)
                .insertMany(fileData);
            Database.disconnect();
            return result ? true : false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
