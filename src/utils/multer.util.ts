import multer from 'multer';
import diskStorageConfig from '@/configs/multer.config';
import { uploadFiledEnum } from '@/constraints/enums/index.enum';

const upload = multer({
    storage: diskStorageConfig,
    fileFilter(req, file, callback) {
        switch (file.fieldname) {
            case uploadFiledEnum.Thumbnail:
                callback(null, true);
                break;
            case uploadFiledEnum.FileSong:
                callback(null, true);
                break;
            default:
                callback(
                    new Error(`Invalid file name with "${file.fieldname}" `),
                );
                break;
        }
    },
});

export default upload;
