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
}
