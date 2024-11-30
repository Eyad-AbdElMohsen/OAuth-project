import dotenv from "dotenv";
dotenv.config()
import express , {Express , Request , Response}from "express" 
import errorMiddleware from "./middlewares/error.middleware";
import notFoundMiddleware from "./middlewares/notFound.middleware";
import {getGoogleOAuthHandler, googleOAuthHandler}  from "./middlewares/getGoogleOAuthHandler.middleware";



const port = process.env.port || 8000

const app : Express = express();

app.use(express.json())

app.get("/",(req : Request ,res : Response) =>{
    res.send("Hello from ts express");
})

app.get('/google-login', getGoogleOAuthHandler)
app.get('/api/sessions/oauth/google', googleOAuthHandler);

// glopal middleware
app.all('*', notFoundMiddleware)


//err handler
app.use(errorMiddleware)

app.listen(port , () => {
    console.log("running on port: " + port);
})