export default interface IAdmin {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: number;
    refreshToken: string;
    createdAt: string;
    updatedAt: string;
}
