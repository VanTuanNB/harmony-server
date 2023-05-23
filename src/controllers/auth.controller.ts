import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import UserModel from '@/models/user.model';
import generateToken from '@/utils/generateToken.util';

export default class AuthController {
    public static async loginForm(
        req: Request,
        res: Response,
    ): Promise<Response | void> {
        try {
            const payload: { email: string; password: string } = req.body;
            if (!payload.email || !payload.password)
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'BAD_REQUEST_PAYLOAD_EMPTY',
                });
            const user = await UserModel.getByEmail(payload.email);
            if (!user.success)
                return res.status(403).json({
                    status: 403,
                    success: false,
                    message: 'LOGIN_FAILED',
                });
            if (payload.email !== user.data?.email)
                return res.status(401).json({
                    status: 401,
                    success: false,
                    message: 'EMAIL_NOT_EXIST',
                });
            const verifyPassword = await bcrypt.compare(
                payload.password,
                user.data.password as string,
            );
            console.log(verifyPassword);
            if (!verifyPassword)
                return res.status(401).json({
                    status: 401,
                    success: false,
                    message: 'INCORRECT_PASSWORD',
                });
            const { accessToken, refreshToken } = generateToken({
                _id: user.data._id,
                email: user.data.email,
            });

            const updated = await UserModel.updateById(user.data._id, {
                refreshToken,
            });

            if (!updated.success)
                return res.status(500).json({
                    status: 500,
                    success: false,
                    message: 'LOGIN_FAILED',
                    errors: updated.errors,
                });
            return res.status(201).json({
                status: 201,
                success: true,
                message: 'LOGIN_SUCCESSFULLY',
                data: {
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error });
        }
    }
}
