import AccountPendingVerifyModel from '@/models/accountPendingVerify.model';
import AlbumModel from '@/models/album.model';
import FavoriteModel from '@/models/favorite.model';
import GenreModel from '@/models/genre.model';
import HistoryModel from '@/models/history.model';
import PlaylistModel from '@/models/paylist.model';
import SongModel from '@/models/song.model';
import SongDraftModel from '@/models/songDraft.model';
import UserModel from '@/models/user.model';

export const accountPendingVerifyModel = new AccountPendingVerifyModel();
export const albumModel = new AlbumModel();
export const favoriteModel = new FavoriteModel();
export const genreModel = new GenreModel();
export const historyModel = new HistoryModel();
export const playlistModel = new PlaylistModel();
export const songModel = new SongModel();
export const songDraftModel = new SongDraftModel();
export const userModel = new UserModel();
