import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

import IAccountPendingVerify from '@/constraints/interfaces/IAccountPendingVerify';
import { CustomResponse } from '@/constraints/interfaces/custom.interface';
import accountPendingVerifySchema from '@/database/schemas/accountPendingVerify.schema';

export default class AccountPendingVerifyModel {
    public static async getByEmail(
        email: string,
    ): Promise<CustomResponse<IAccountPendingVerify | null>> {
        try {
            const account = await accountPendingVerifySchema.findOne({ email });
            return {
                status: 200,
                success: true,
                message: 'GET_VERIFICATION_EMAIL_SUCCESSFULLY',
                data: account,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'GET_VERIFICATION_EMAIL_FAILED',
            };
        }
    }
    public static async create(
        payload: Omit<IAccountPendingVerify, '_id' | 'verificationCode'>,
    ): Promise<CustomResponse<IAccountPendingVerify>> {
        try {
            const _id: string = uuidv4();
            const randomCode: number = Math.floor(Math.random() * 1000);
            const verificationCode =
                randomCode < 1000 ? randomCode * 10 : randomCode;
            const hashPassword = await bcrypt.hash(payload.password, 10);
            const created = await accountPendingVerifySchema.create({
                _id,
                verificationCode,
                ...payload,
                password: hashPassword,
            });
            return {
                status: 201,
                success: true,
                message: 'POST_ACCOUNT_PENDING_VERIFY_SUCCESSFULLY',
                data: created,
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'POST_ACCOUNT_PENDING_VERIFY_FAILED',
                errors: error,
            };
        }
    }
    public static async deleteById(_id: string): Promise<CustomResponse> {
        try {
            const deleted = await accountPendingVerifySchema.findByIdAndDelete(
                _id,
            );
            return {
                status: 204,
                success: true,
                message: 'DELETE_VERIFICATION_EMAIL_SUCCESSFULLY',
            };
        } catch (error) {
            console.log(error);
            return {
                status: 500,
                success: false,
                message: 'DELETE_VERIFICATION_EMAIL_FAILED',
            };
        }
    }
}
