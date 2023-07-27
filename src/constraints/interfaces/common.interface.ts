export interface IPayloadRequestSignedUrlS3 {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    key: string;
}

export interface IPayloadToken {
    _id: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export interface IFieldNameFiles {
    [fieldname: string]: Express.Multer.File[];
}
