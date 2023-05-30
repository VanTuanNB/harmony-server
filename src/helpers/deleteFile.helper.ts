import fs from 'fs';

export default function handleDeleteFile(file: Express.Multer.File): void {
    try {
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) throw new Error(JSON.stringify(err));
            });
        }
    } catch (error) {
        console.log(error);
    }
}
