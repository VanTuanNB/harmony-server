require('dotenv').config();
import fs from 'fs';

import mongoose from 'mongoose';
import path from 'path';

export default class HistoryMigration {
    public static async create(db: mongoose.mongo.Db): Promise<boolean> {
        try {
            const filePath = path.join(
                __dirname,
                '../',
                'database',
                'backups',
                'histories.json',
            );
            const fileContent = fs.readFileSync(filePath, {
                encoding: 'utf-8',
            });
            const fileData = JSON.parse(fileContent);
            const collectionName = 'histories';
            const isExits = !!(await db
                .listCollections({ name: collectionName })
                .next());
            if (isExits) db.collection(collectionName).drop();
            const result = await db
                .collection(collectionName)
                .insertMany(fileData);
            console.log('create histories collection successfully');
            return result ? true : false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
