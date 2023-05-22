import { config } from 'dotenv';
import nodemailer from 'nodemailer';
config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_SERVER as string,
        pass: process.env.PASSWORD_GMAIL_SERVER as string,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export default transporter;
