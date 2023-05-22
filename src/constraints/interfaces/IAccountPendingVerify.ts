export default interface IAccountPendingVerify {
    _id: string;
    username: string;
    email: string;
    password: string;
    verificationCode: number;
    verifyStatus?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
