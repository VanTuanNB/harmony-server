import path from 'path'

export function pathFromSystem(paths: string, plaform: string | undefined) {
    const dirname = __dirname;

    if (plaform === 'win32') {
        const dirnameLinux = path.posix.join(dirname.split(path.sep).join(path.posix.sep))
        const arr = dirnameLinux.split('/');
        const index = arr.indexOf("src");
        const prefix = arr.slice(0, index).join("/");
        const linuxPath = path.posix.join(paths.split(path.sep).join(path.posix.sep)).split(prefix + '/')[1];
        return linuxPath;
    } else {
        const dirnameLinux = __dirname
        const arr = dirnameLinux.split('/');
        const index = arr.indexOf("src");
        const prefix = arr.slice(0, index).join("/");
        const linuxPath = paths.split(prefix + '/')[1];
        return linuxPath;
    }
}