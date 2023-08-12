import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

import { IAdmin } from '@/constraints/interfaces/ICollection.interface';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import { adminModel } from '@/instances/index.instance';
import { generateToken } from '@/utils/jwtToken.util';
import { RoleConstant } from '@/constraints/enums/role.enum';
import AdminFilter from '@/filters/admin.filter';
import ValidatePayload from '@/helpers/validate.helper';

export default class AdminService {
    constructor() {}

    public async getById(_id: string): Promise<CustomResponse<IAdmin | null>> {
        try {
            const currentAdmin = await adminModel.getById(_id);
            return {
                status: 200,
                success: true,
                message: 'GET_ADMIN_BY_ID_SUCCESSFULLY',
                data: currentAdmin,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ADMIN_BY_ID_FAILED',
                errors: error,
            };
        }
    }

    public async getByEmail(
        email: string,
    ): Promise<CustomResponse<IAdmin | null>> {
        try {
            const currentAdmin = await adminModel.getByEmail(email);
            return {
                status: 200,
                success: true,
                message: 'GET_ADMIN_BY_EMAIL_SUCCESSFULLY',
                data: currentAdmin,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ADMIN_BY_EMAIL_FAILED',
                errors: error,
            };
        }
    }

    public async create(
        payload: Pick<IAdmin, 'email' | 'password' | 'name'>,
    ): Promise<CustomResponse> {
        try {
            const currentAdmin = await adminModel.getByEmail(payload.email);
            if (currentAdmin)
                return {
                    status: 400,
                    success: false,
                    message: 'EMAIL_NOT_FOUND',
                };
            const _id: string = uuidv4();
            const { accessToken, refreshToken } = generateToken({
                _id,
                email: payload.email,
                role: RoleConstant.ROOT_ADMIN,
            });
            const hashPassword = await bcrypt.hash(payload.password, 10);
            const adminFilter = new AdminFilter({
                _id,
                email: payload.email,
                name: payload.name,
                refreshToken,
                password: hashPassword,
                role: RoleConstant.ROOT_ADMIN,
                avatar: undefined,
            });
            const validation = await ValidatePayload(
                adminFilter,
                'BAD_REQUEST',
                true,
            );
            if (validation) return validation;
            await adminModel.create(adminFilter);
            return {
                status: 201,
                success: true,
                message: 'SIGN_UP_FORM_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            };
        } catch (error) {
            return {
                status: 500,
                success: false,
                message: 'SIGN_UP_FORM_FAILED',
                errors: error,
            };
        }
    }

    public async updateById(
        _id: string,
        payload: Partial<Omit<IAdmin, '_id'>>,
    ): Promise<CustomResponse<IAdmin | null>> {
        try {
            const updated = await adminModel.update(_id, payload);
            return {
                status: 200,
                success: true,
                message: 'GET_ADMIN_BY_EMAIL_SUCCESSFULLY',
                data: updated,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_ADMIN_BY_EMAIL_FAILED',
                errors: error,
            };
        }
    }
}
