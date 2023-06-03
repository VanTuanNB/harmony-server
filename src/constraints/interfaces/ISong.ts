export default interface ISong {
    _id: string;
    title: string;
    duration: number;
    thumbnail?: string;
    composerReference: string;
    songPathReference?: string;
    publish: Date;
    albumReference?: string[];
    genresReference: string[];
    performers: Array<string>;
    views?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
