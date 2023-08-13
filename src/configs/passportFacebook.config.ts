import passport from 'passport';
import { Strategy } from 'passport-facebook';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { generateToken } from '@/utils/jwtToken.util';
import { RoleConstant } from '@/constraints/enums/role.enum';
import { userModel } from '@/instances/index.instance';
config();

passport.use(
    new Strategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            callbackURL: '/api/v1/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async function (accessTokens, refreshTokens, profile, cb) {
            const email = profile._json.email as string;
            const user = await userModel.getByEmail(email);
            if (!user) {
                const _id: string = uuidv4();
                const { accessToken, refreshToken } = generateToken({
                    _id,
                    email: email,
                    role: RoleConstant.USER,
                });
                const newUser = await userModel.create({
                    _id: _id,
                    name: profile._json.name as string,
                    email: profile._json.email as string,
                    avatarUrl: profile._json.picture.data.url,
                    refreshToken: refreshToken,
                    role: RoleConstant.USER,
                    avatarS3: null,
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
