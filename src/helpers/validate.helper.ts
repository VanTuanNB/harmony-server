import { Validator } from 'class-validator';

import { CustomResponse } from '@/constraints/interfaces/custom.interface';

export default async function ValidatePayload(
    payload: any,
    message: string,
    showError: boolean = false,
): Promise<CustomResponse | null> {
    console.log(message);
    console.log(payload);
    const validation = await new Validator().validate(payload, {
        enableDebugMessages: true,
        strictGroups: true,
    });
    console.log(validation);
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
