import dotenv from 'dotenv'
dotenv.config()
import { Request, Response } from "express";
import ApiError from '../errors/api.error';
import asyncWrapper from './asyncWrapper.middleware';
import { getGoogleAuthTokens, getGoogleUser } from '../services/user.service';
import { createAccessToken, createRefreshToken, createSession, setCookies } from '../services/auth.service';


export const getGoogleOAuthHandler = (req: Request, res: Response)=> {
    const clientId = process.env.ClientID
    const redirectUrl = process.env.googleOAuthRedirectUrl
    const scope = 'email profile'

    if(!clientId || !redirectUrl)
        throw new ApiError('Missing OAuth configuration', 500, 'getGoogleOAuthHandler middleware')

    const options = {
        client_id: clientId, 
        redirect_uri: redirectUrl, 
        scope: scope, 
        prompt: 'consent', 
        access_type: 'offline',
        response_type: 'code'
    };

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(options).toString()}`;
    res.status(200).json({ oauthUrl });
}

export const googleOAuthHandler = asyncWrapper(async(req: Request, res: Response) => {
    // get code from qs
    const code = req.query.code as string

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }
    // get id and access token with the code 
    const data = await getGoogleAuthTokens(code);

    // get the user with tokens 
    const googleUser = await getGoogleUser( data.id_token, data.access_token)

    // upsert (update or insert) the user
	if(!googleUser.verified_email) res.status(403).send('google acc is not verified')
        //// No DataBase in this project sorry
    // const user = await findAndUpdateUser({ 
    //     email: googleUser.email
    // }, {
    //     email: googleUser.email,
    //     name: googleUser.name,
    //     picture: googleUser.picture
    // }, {
    //     upsert: true,
    //     new: true
    // });  


    const userId = googleUser.id; // For example, you can use Google ID as your user identifier

    // Create access and refresh tokens
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    // Create session 
    const sessionId = createSession(userId, accessToken, refreshToken);

    // Set cookies
    setCookies(res, accessToken, refreshToken);

    // Redirect the user back to the client with the session and tokens
    res.status(200).send({
        data: {
            user: googleUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
            sessionId: sessionId,
        }
    })

})