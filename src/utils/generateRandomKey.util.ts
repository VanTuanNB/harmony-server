import crypto from 'crypto';

export default function generateRandomString(length: number): string {
    const randomBytes = crypto.randomBytes(length / 2);
    return randomBytes.toString('hex').slice(0, length);
}
