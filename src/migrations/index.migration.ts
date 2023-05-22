require('dotenv').config();
import 'module-alias/register';
import { exit } from 'process';
import SongMigration from '@/migrations/song.migration';

const createCollection = async (): Promise<void> => {
    try {
        await Promise.all([SongMigration.create()]).finally(() => {
            console.log('songs collection successfully created');
        });
        exit();
    } catch (error) {
        console.log(error);
    }
};

createCollection();
