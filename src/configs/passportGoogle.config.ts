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
            const email = profile._json.email as string; 
            
            const user = await UserModel.getByEmail(email)
            if (!user) {
                const newUser = await UserModel.createPassport({ 
                    name: profile._json.name as string,
                    email: profile._json.email as string,
                    avatar: profile._json.picture,
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
