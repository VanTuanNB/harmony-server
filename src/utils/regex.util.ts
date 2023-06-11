export function regexUuidV4Validation(id: string): boolean {
    const regex =
        /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;
    return regex.test(id);
}

export function regexEmail(email: string): boolean {
    const regexEmail =
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
    return regexEmail.test(email);
}
