export function regexUuidV4Validation(id: string): boolean {
    const regex =
        /^[0-9(a-f|A-F)]{8}-[0-9(a-f|A-F)]{4}-4[0-9(a-f|A-F)]{3}-[89ab][0-9(a-f|A-F)]{3}-[0-9(a-f|A-F)]{12}$/;
    return regex.test(id);
}

export function regexEmail(email: string): boolean {
    const regexEmail =
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]+)(\.[a-zA-Z]{2,5}){1,2}$/;
    return regexEmail.test(email);
}
