require('dotenv').config();
import 'module-alias/register';
import { exit } from 'process';
import SongMigration from '@/migrations/song.migration';
import ComposerMigration from '@/migrations/composer.migration';
import UserMigration from '@/migrations/user.migration';
import SongPathMigration from '@/migrations/songPath.migration';
import GenreMigration from '@/migrations/genre.migration';
import AlbumMigration from '@/migrations/album.migration';
import ThumbnailMigration from '@/migrations/thumbnail.migration';
import Database from '@/database/connect.db';

const createCollection = async (): Promise<void> => {
    try {
        const db = await Database.connect();
        await Promise.all([
            SongMigration.create(db),
            ComposerMigration.create(db),
            UserMigration.create(db),
            SongPathMigration.create(db),
            GenreMigration.create(db),
            AlbumMigration.create(db),
            ThumbnailMigration.create(db),
        ]).finally(() => {
            Database.disconnect();
        });
        exit();
    } catch (error) {
        console.log(error);
    }
};

createCollection();
