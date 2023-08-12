import { RoleConstant } from '@/constraints/enums/role.enum';
import { IAdmin } from '@/constraints/interfaces/index.interface';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export default class AdminFilter implements IAdmin {
    @IsNotEmpty()
    @IsUUID()
    _id: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    role: RoleConstant.ROOT_ADMIN;

    @IsNotEmpty()
    @IsString()
    refreshToken: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    constructor(props: IAdmin) {
        this._id = props._id;
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
        this.role = props.role;
        this.refreshToken = props.refreshToken;
        this.avatar = props.avatar;
    }
}
