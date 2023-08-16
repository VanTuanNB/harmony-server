import { RoleConstant } from '@/constraints/enums/role.enum';
import { environment } from '@/environments/environment';
import { userModel } from '@/instances/index.instance';
import { generateToken } from '@/utils/jwtToken.util';
import { config } from 'dotenv';
import passport from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { v4 as uuidv4 } from 'uuid';
config();

passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: `${environment.ORIGIN}/${environment.PREFIX}/${environment.VERSION}/auth/google/callback`,
            scope: ['profile'],
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
                    avatarUrl: profile._json.picture,
                    locale: profile._json.locale,
                    refreshToken: refreshToken,
                    role: RoleConstant.USER,
                    avatarS3: null,
                });
                cb(null, newUser);
            } else {
                cb(null, user);
            }
        },
    ),
);
