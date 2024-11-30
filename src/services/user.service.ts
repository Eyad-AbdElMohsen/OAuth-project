import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios';
import qs from 'qs';
import ApiError from '../errors/api.error';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { IUser, User } from '../models/user.model';

interface GoogleTokenResult {
	access_token: string,
	expires_in: Number,
	refresh_token: string,
	scope: string,
	id_token: string
}

const clientId = process.env.ClientID
const clientSecret = process.env.ClientSecret
const redirectUrl = process.env.googleOAuthRedirectUrl

if(!clientId || !clientSecret || !redirectUrl)
    throw new ApiError('Missing OAuth configuration', 500, 'getGoogleAuthTokens service')


export const getGoogleAuthTokens = async (code: string): 
Promise<GoogleTokenResult>  => {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code, 
        clientId: clientId, 
        clientSecret: clientSecret, 
        redirectUri: redirectUrl,
        grantType: 'authorization_code',
    }
    try{
        const res = await axios.post<GoogleTokenResult>(
            url,
            qs.stringify(values),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        // res.data is access token & refresh token
        return res.data
    }catch(err: any){
        throw new ApiError('Failed to fetch Google OAuth tokens', 500, 'getGoogleAuthTokens service');
    }
}


interface GoogleUserResult {
	id: string, 
	email: string,
	verified_email: boolean,
	name: string,
	given_name: string,
	family_name: string,
	picture: string,
	locale: string
}

export const getGoogleUser = async(idToken: string, accessToken: string):
Promise<GoogleUserResult> => {
    try{
		const res = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        // res.data is the googleUser
		return res.data
	}catch(error: any){
        throw new ApiError('Failed to fetch Google OAuth user', 500, 'getGoogleUser service');
	}
} 

        //// No DataBase in this project sorry
// export const findAndUpdateUser = async(query: FilterQuery<IUser>,
// 	update: UpdateQuery<IUser>,
// 	options: QueryOptions = {}
// 	) => {
// 	return User.findOneAndUpdate(query, update, options)
// }