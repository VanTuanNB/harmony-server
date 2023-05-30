import {
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';
import regexUuidV4Validation from '@/utils/regexUuidv4.util';
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
                validate(
                    value: Pick<T, '_id'> | Pick<T, '_id'>[],
                    args: ValidationArguments,
                ) {
                    const object = args.object;
                    const property = (object as any)[propertyName];
                    console.log(value);
                    if (typeof value === 'string') {
                        return false;
                    } else {
                        if (Array.isArray(value)) {
                            return value.every((element: { _id: string }) =>
                                regexUuidV4Validation(element._id),
                            );
                        } else {
                            return regexUuidV4Validation(value._id);
                        }
                    }
                },
            },
        });
    };
}

// ngày mai fix lỗi decorator này
// validate data song post
