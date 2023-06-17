import sharp from 'sharp';
import fs from 'fs/promises';

export default class ThumbnailRepository {
    public static async getInformationThumbnail(
        path: string,
        resize?: string,
    ): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            if (resize) {
                sharp(path)
                    .toFormat('jpeg')
                    .resize(
                        Number.parseInt(resize.split('x')[0]),
                        Number.parseInt(resize.split('x')[1]),
                    )
                    .toBuffer((err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
            } else {
                sharp(path)
                    .toFormat('jpeg')
                    .toBuffer((err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
            }
        });
    }

    public static async forceDelete(path: string): Promise<void> {
        return await fs.unlink(path);
    }
}
