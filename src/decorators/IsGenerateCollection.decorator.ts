import {
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';
import { regexUuidV4Validation } from '@/utils/regex.util';
export default function IsGenerateCollection<T extends { _id: string }>(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: string | string[], args: ValidationArguments) {
                    try {
                        const object = args.object;
                        const property = (object as any)[propertyName];
                        if (Array.isArray(value)) {
                            return value.every((element: string) =>
                                regexUuidV4Validation(element),
                            );
                        } else {
                            return regexUuidV4Validation(value);
                        }
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                },
            },
        });
    };
}
