import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'  
import { Response } from 'express';
import cookie from 'cookie';

export const createAccessToken = (userId: string): string => {
    const payload = { userId };
    const secretKey = process.env.JWT_ACCESS_SECRET!;
    const options = { expiresIn: '15m' }; // Access token expires in 15 minutes
    return jwt.sign(payload, secretKey, options);
};

export const createRefreshToken = (userId: string): string => {
    const payload = { userId };
    const secretKey = process.env.JWT_REFRESH_SECRET!;
    const options = { expiresIn: '1y' }; // Refresh token expires in 1 year
    return jwt.sign(payload, secretKey, options);
};

interface Session {
    userId: string;
    accessToken: string;
    refreshToken: string;
}

const sessions: Record<string, Session> = {};

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
};

export const createSession = (userId: string, accessToken: string, refreshToken: string) => {
    const sessionId = generateSessionId();
    sessions[sessionId] = {
        userId,
        accessToken,
        refreshToken
    };
    return sessionId;
};

export const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
    const accessTokenCookie = `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; ${
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`;

    const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${365 * 24 * 60 * 60}; ${
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`;

    // Setting both cookies using the Set-Cookie header
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
}