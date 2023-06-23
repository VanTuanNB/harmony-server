import fs from 'fs/promises';

import ffmpeg from '@/configs/fluentFfmpeg.config';

export default class SongRepository {
    public static async getInformationFileSong(
        file: Express.Multer.File,
    ): Promise<ffmpeg.FfprobeData> {
        return new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
            ffmpeg.ffprobe(file.path, async (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    public static async getStream(path: string): Promise<ffmpeg.FfmpegCommand> {
        return new Promise<ffmpeg.FfmpegCommand>((resolve, reject) => {
            resolve(ffmpeg(path));
        });
    }

    public static async forceDelete(path: string): Promise<void> {
        return await fs.unlink(path);
    }
}
