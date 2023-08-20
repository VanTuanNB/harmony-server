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

export interface IEnvironment {
    ORIGIN: string;
    VERSION: string;
    PREFIX: string;
    CLIENT_URL: string;
    IS_PRODUCTION: boolean;
    DOMAIN_CLIENT: string;
}
