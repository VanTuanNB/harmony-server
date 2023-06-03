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

const createCollection = async (): Promise<void> => {
    try {
        await Promise.all([
            SongMigration.create(),
            ComposerMigration.create(),
            UserMigration.create(),
            SongPathMigration.create(),
            GenreMigration.create(),
            AlbumMigration.create(),
            ThumbnailMigration.create(),
        ]).finally(() => {
            console.log('songs collection successfully created');
        });
        exit();
    } catch (error) {
        console.log(error);
    }
};

createCollection();
