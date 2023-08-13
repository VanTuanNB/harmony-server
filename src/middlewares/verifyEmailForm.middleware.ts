import { NextFunction, Request, Response } from 'express';
import {
    accountPendingVerifyModel,
    userModel,
} from '@/instances/index.instance';

export default async function verificationEmailWithForm(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    try {
        const payload: { email: string; verificationCode: number } = req.body;
        if (!payload.email || !payload.verificationCode)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'BAD_REQUEST_PAYLOAD_EMPTY',
            });
        const collectionUser = await userModel.getByEmail(payload.email);
        if (
            collectionUser &&
            collectionUser.email === payload.email &&
            !collectionUser.isRegistrationForm
        )
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'GMAIL_ALREADY_EXISTS',
            });
        const currentGmail = await accountPendingVerifyModel.getByEmail(
            payload.email,
        );
        if (!currentGmail)
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'BAD_REQUEST',
            });
        const isVerify =
            payload.verificationCode === currentGmail.verificationCode;
        if (!isVerify)
            return res.status(403).json({
                status: 403,
                success: false,
                message: 'VERIFICATION_CODE_NOT_MATCH',
            });
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}
