import { errorHandler, rateLimitor } from './middlewares/index.js';
import cors from 'cors'
import { APP_PORT, DB_URL } from './config/index.js'
import router from './Routes/index.js'
import cronTask from './cronTask.js';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config();
import bodyParser from 'body-parser';



// const upload=require('multer')
const express = require('express');
const mongoose = require('mongoose')


const app = express();
mongoose.connect(DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection Error :'))
db.once('open', () => {
    console.log('DB connected SuccesFully AT Backend ! .....')
})
//
app.use(cors())

// app.use(upload.array());
cronTask()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "./public"))
app.use(express.json());
app.use('/', express.static('uploads'))
app.use(cookieParser());
app.use('/api', router);

app.use(errorHandler)
app.use('/api/test', rateLimitor)
//


app.listen(APP_PORT, (error) => {
    if (error) console.log(error)
    console.log("app is running on :", APP_PORT);

})
