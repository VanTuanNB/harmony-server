import passport from 'passport'
import { Strategy } from 'passport-google-oauth20'
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import UserModel from '@/models/user.model';
import generateToken from '@/utils/generateToken.util';
config()

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "http://localhost:5000/api/v1/auth/google/callback",
    scope: ['profile'],

}, async function (accessTokens, refreshTokens, profile, cb) {
    // console.log(profile);
    // cb(null, profile)

    const email = profile._json.email as string;
    const user = await UserModel.getByEmail(email);
    const _id: string = uuidv4();
    const { accessToken, refreshToken } = generateToken({
        _id,
        email: email,
    });
    if (!user) {
        const newUser = await UserModel.create({
            _id: _id,
            name: profile._json.name as string,
            email: profile._json.email as string,
            avatar: profile._json.picture,
            locale: profile._json.locale,
            refreshToken: refreshToken
        })
        cb(null, newUser)
    }
    if (user?.isRegistrationForm == false) {
        cb(null, user)
    } else {
        return {
            status: 400,
            success: false,
            message: 'The account you have registered by form',
        }
    }

}))