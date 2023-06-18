import path from 'path'

export function pathFromSystem(paths: string, plaform: string | undefined) {
    if (plaform === 'win32') {
        const linuxPath = path.posix.join(paths.split(path.sep).join(path.posix.sep)).split('harmony-server/')[1];
        return linuxPath;
    } else {
        return paths;
    }
}