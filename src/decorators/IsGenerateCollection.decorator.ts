import { ValidationArguments, registerDecorator } from 'class-validator';
interface TypeProps {
    name: string;
    message: string;
}
export default function IsGenerateCollection<T>(payload: TypeProps) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: payload.name,
            target: object.constructor,
            propertyName,
            validator: {
                validate(value: Partial<T> | any, args: ValidationArguments) {
                    const object = args.object;
                    const property = (object as any)[propertyName];
                    return (
                        (value || value.length > 0) &&
                        (typeof value._id === 'string' ||
                            typeof value[0]._id === 'string')
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return payload.message;
                },
            },
        });
    };
}
