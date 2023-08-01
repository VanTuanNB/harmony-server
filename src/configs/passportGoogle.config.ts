import passport from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import UserModel from '@/models/user.model';
import { generateToken } from '@/utils/jwtToken.util';
import { RoleConstant } from '@/constraints/enums/role.enum';
config();

passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
            scope: ['profile'],
        },
        async function (accessTokens, refreshTokens, profile, cb) {
            const email = profile._json.email as string;
            const user = await UserModel.getByEmail(email);
            if (!user) {
                const _id: string = uuidv4();
                const { accessToken, refreshToken } = generateToken({
                    _id,
                    email: email,
                    role: RoleConstant.USER,
                });
                const newUser = await UserModel.create({
                    _id: _id,
                    name: profile._json.name as string,
                    email: profile._json.email as string,
                    avatar: profile._json.picture,
                    locale: profile._json.locale,
                    refreshToken: refreshToken,
                    role: RoleConstant.USER,
                });
                cb(null, newUser);
            } else if (user?.isRegistrationForm) {
                return {
                    status: 400,
                    success: false,
                    message: 'The account you have registered by form',
                };
            } else {
                cb(null, user);
            }
        },
    ),
);
