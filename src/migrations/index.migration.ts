require('dotenv').config();

import { exit } from 'process';

import Database from '@/database/connect.db';
import AlbumMigration from '@/migrations/album.migration';
import GenreMigration from '@/migrations/genre.migration';
import SongMigration from '@/migrations/song.migration';
import UserMigration from '@/migrations/user.migration';
import AccountPendingVerifyMigration from './accountPendingVerify.migration';
import HistoryMigration from './history.migration';
import PlaylistMigration from './playlist.migration';
import SongDraftMigration from './songDraft.migration';

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
