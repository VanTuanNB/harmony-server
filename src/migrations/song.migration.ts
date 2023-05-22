require('dotenv').config();
import 'module-alias/register';
import path from 'path';
import fs from 'fs';

import Database from '@/database/connect.db';

export default class SongMigration {
    public static async create(): Promise<boolean> {
        try {
            const db = await Database.connect();
            const filePath = path.join(
                __dirname,
                '../',
                'database',
                'backups',
                'songs.json',
            );
            const fileContent = fs.readFileSync(filePath, {
                encoding: 'utf-8',
            });
            const songData = JSON.parse(fileContent);
            const collectionName = 'songs';
            const isExits = !!(await db
                .listCollections({ name: collectionName })
                .next());
            if (isExits) db.collection(collectionName).drop();
            const result = await db
                .collection(collectionName)
                .insertMany(songData);
            Database.disconnect();
            return result ? true : false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
