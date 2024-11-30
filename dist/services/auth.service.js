"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookies = exports.createSession = exports.createRefreshToken = exports.createAccessToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createAccessToken = (userId) => {
    const payload = { userId };
    const secretKey = process.env.JWT_ACCESS_SECRET;
    const options = { expiresIn: '15m' }; // Access token expires in 15 minutes
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (userId) => {
    const payload = { userId };
    const secretKey = process.env.JWT_REFRESH_SECRET;
    const options = { expiresIn: '1y' }; // Refresh token expires in 1 year
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
};
exports.createRefreshToken = createRefreshToken;
const sessions = {};
const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
};
const createSession = (userId, accessToken, refreshToken) => {
    const sessionId = generateSessionId();
    sessions[sessionId] = {
        userId,
        accessToken,
        refreshToken
    };
    return sessionId;
};
exports.createSession = createSession;
const setCookies = (res, accessToken, refreshToken) => {
    const accessTokenCookie = `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${15 * 60}; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
    const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${365 * 24 * 60 * 60}; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`;
    // Setting both cookies using the Set-Cookie header
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
};
exports.setCookies = setCookies;
