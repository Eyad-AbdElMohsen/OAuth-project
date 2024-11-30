"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthHandler = exports.getGoogleOAuthHandler = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const api_error_1 = __importDefault(require("../errors/api.error"));
const asyncWrapper_middleware_1 = __importDefault(require("./asyncWrapper.middleware"));
const user_service_1 = require("../services/user.service");
const auth_service_1 = require("../services/auth.service");
const getGoogleOAuthHandler = (req, res) => {
    const clientId = process.env.ClientID;
    const redirectUrl = process.env.googleOAuthRedirectUrl;
    const scope = 'email profile';
    if (!clientId || !redirectUrl)
        throw new api_error_1.default('Missing OAuth configuration', 500, 'getGoogleOAuthHandler middleware');
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
};
exports.getGoogleOAuthHandler = getGoogleOAuthHandler;
exports.googleOAuthHandler = (0, asyncWrapper_middleware_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get code from qs
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }
    // get id and access token with the code 
    const data = yield (0, user_service_1.getGoogleAuthTokens)(code);
    // get the user with tokens 
    const googleUser = yield (0, user_service_1.getGoogleUser)(data.id_token, data.access_token);
    // upsert (update or insert) the user
    if (!googleUser.verified_email)
        res.status(403).send('google acc is not verified');
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
    const accessToken = (0, auth_service_1.createAccessToken)(userId);
    const refreshToken = (0, auth_service_1.createRefreshToken)(userId);
    // Create session 
    const sessionId = (0, auth_service_1.createSession)(userId, accessToken, refreshToken);
    // Set cookies
    (0, auth_service_1.setCookies)(res, accessToken, refreshToken);
    // Redirect the user back to the client with the session and tokens
    res.status(200).send({
        data: {
            user: googleUser,
            accessToken: accessToken,
            refreshToken: refreshToken,
            sessionId: sessionId,
        }
    });
}));
