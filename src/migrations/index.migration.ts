require('dotenv').config();
import 'module-alias/register';
import { exit } from 'process';

import SongMigration from '@/migrations/song.migration';
import UserMigration from '@/migrations/user.migration';
import GenreMigration from '@/migrations/genre.migration';
import AlbumMigration from '@/migrations/album.migration';
import Database from '@/database/connect.db';
import SongDraftMigration from './songDraft.migration';
import PlaylistMigration from './playlist.migration';
import AccountPendingVerifyMigration from './accountPendingVerify.migration';
import HistoryMigration from './history.migration';

const createCollection = async (): Promise<void> => {
    try {
        const db = await Database.connect();
        await Promise.all([
            SongMigration.create(db),
            UserMigration.create(db),
            GenreMigration.create(db),
            AlbumMigration.create(db),
            SongDraftMigration.create(db),
            PlaylistMigration.create(db),
            AccountPendingVerifyMigration.create(db),
            HistoryMigration.create(db),
        ]).finally(() => {
            Database.disconnect();
        });
        exit();
    } catch (error) {
        console.log(error);
    }
};

createCollection();
