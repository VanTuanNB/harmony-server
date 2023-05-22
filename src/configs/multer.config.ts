import multer from 'multer';
import path from 'path';
const diskStorageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        switch (file.fieldname) {
            case 'thumbnail':
                cb(
                    null,
                    path.join(
                        __dirname.replace(
                            'configs',
                            'resources/music/thumbnails',
                        ),
                    ),
                );
                break;
            case 'fileSong':
                cb(
                    null,
                    path.join(
                        __dirname.replace('configs', 'resources/music/files'),
                    ),
                );
                break;
            default:
                cb(null, path.join(__dirname.replace('configs', 'resources')));
                break;
        }
    },
    // filename: function (req, file, cb) {
    //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    //     if (file.fieldname === 'img') {
    //         cb(
    //             null,
    //             file.fieldname +
    //                 uniqueSuffix +
    //                 '.' +
    //                 file.mimetype.split('/')[1],
    //         );
    //     } else if (file.fieldname === 'mp3') {
    //         cb(
    //             null,
    //             file.fieldname +
    //                 uniqueSuffix +
    //                 '.' +
    //                 file.mimetype.split('/')[1],
    //         );
    //     } else {
    //         cb(new Error('Invalid field name'), JSON.stringify(false));
    //     }
    // },
});

export default diskStorageConfig;
