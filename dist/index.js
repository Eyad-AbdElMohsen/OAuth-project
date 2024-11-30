"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const notFound_middleware_1 = __importDefault(require("./middlewares/notFound.middleware"));
const getGoogleOAuthHandler_middleware_1 = require("./middlewares/getGoogleOAuthHandler.middleware");
const port = process.env.port || 8000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello from ts express");
});
app.get('/google-login', getGoogleOAuthHandler_middleware_1.getGoogleOAuthHandler);
app.get('/api/sessions/oauth/google', getGoogleOAuthHandler_middleware_1.googleOAuthHandler);
// glopal middleware
app.all('*', notFound_middleware_1.default);
//err handler
app.use(error_middleware_1.default);
app.listen(port, () => {
    console.log("running on port: " + port);
});
