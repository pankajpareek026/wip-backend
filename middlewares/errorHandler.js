
import { DEBUG_MODE } from '../config/index.js'
import ValidationError from 'joi';
import CustomErroHandler from '../services/CustomErrorHandler.js';
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let data = {
        message: "Internal Server Error !",
        ...(DEBUG_MODE === 'true' && { originalErrorAtErrorHandler: error.message }),
    }
    // console.log("Errror Handler Clled", error)
    if (error instanceof ValidationError) {
        statusCode = 422;
        data = {
            message: error.message
        }
    }
    if (error instanceof CustomErroHandler) {
        // statusCode = error.status;
        // statusType=error.type
        data = {
            type: error.type,
            message: error.message,
            status: error.status,

        }
    }

    return res.status(statusCode).json(data)
}

export default errorHandler;