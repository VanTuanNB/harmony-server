import { Validator } from 'class-validator';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';

export default async function ValidatePayload(
    payload: any,
    message: string,
    showError: boolean = false,
): Promise<CustomResponse | null> {
    const validation = await new Validator().validate(payload);

    if (validation.length > 0) {
        return {
            status: 400,
            message,
            success: false,
            errors: showError ? validation : undefined,
        };
    }
    return null;
}
