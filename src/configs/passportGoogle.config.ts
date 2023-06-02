import { Strategy } from 'passport-google-oauth20'
import passport from "passport";
import { config } from 'dotenv';
import UserModel from '@/models/user.model';
import IsRequirementReq from '@/decorators/IsRequirementReq.decorator';
config()

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: "/api/v1/auth/google/callback",
    scope: ['profile'],
},
    async (accessTokens, refreshTokens, profile, done) => {
        try {
            let em = profile.emails?.[0].value as string;
            
            const user = await UserModel.getByEmail(em)
            if (!user) {
                const newUser = await UserModel.createPassport({ 
                    name: profile.displayName,
                    email: profile.emails?.[0].value as string,
                    avatar: profile.photos?.[0].value,
                    locale: profile._json.locale,})
                if (newUser) {
                    done(null, newUser);
                }
            } else {
                done(null, user);
            }
        } catch (error) {
            console.log(error);
        }
    }
));
