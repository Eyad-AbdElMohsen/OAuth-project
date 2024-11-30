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
exports.getGoogleUser = exports.getGoogleAuthTokens = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const api_error_1 = __importDefault(require("../errors/api.error"));
const clientId = process.env.ClientID;
const clientSecret = process.env.ClientSecret;
const redirectUrl = process.env.googleOAuthRedirectUrl;
if (!clientId || !clientSecret || !redirectUrl)
    throw new api_error_1.default('Missing OAuth configuration', 500, 'getGoogleAuthTokens service');
const getGoogleAuthTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUrl,
        grantType: 'authorization_code',
    };
    try {
        const res = yield axios_1.default.post(url, qs_1.default.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        // res.data is access token & refresh token
        return res.data;
    }
    catch (err) {
        throw new api_error_1.default('Failed to fetch Google OAuth tokens', 500, 'getGoogleAuthTokens service');
    }
});
exports.getGoogleAuthTokens = getGoogleAuthTokens;
const getGoogleUser = (idToken, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        // res.data is the googleUser
        return res.data;
    }
    catch (error) {
        throw new api_error_1.default('Failed to fetch Google OAuth user', 500, 'getGoogleUser service');
    }
});
exports.getGoogleUser = getGoogleUser;
//// No DataBase in this project sorry
// export const findAndUpdateUser = async(query: FilterQuery<IUser>,
// 	update: UpdateQuery<IUser>,
// 	options: QueryOptions = {}
// 	) => {
// 	return User.findOneAndUpdate(query, update, options)
// }
