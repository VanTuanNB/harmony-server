import multer from 'multer';
import diskStorageConfig from '@/configs/multer.config';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';

const upload = multer({
    storage: diskStorageConfig,
    fileFilter(req, file, callback) {
        switch (file.fieldname) {
            case uploadFiledEnum.FileSong:
                return file.mimetype === 'audio/mpeg'
                    ? callback(null, true)
                    : callback(
                          new Error(`${file.fieldname} type is not audio/mpeg`),
                      );
            case uploadFiledEnum.Thumbnail:
                const conditionMimeType = [
                    'image/jpeg',
                    'image/png',
                    'image/png',
                ];
                return conditionMimeType.indexOf(file.mimetype) !== -1
                    ? callback(null, true)
                    : callback(new Error(`${file.fieldname} type is not `));
            default:
                callback(
                    new Error(`Invalid file name with "${file.fieldname}" `),
                );
                break;
        }
    },
});

export default upload;
