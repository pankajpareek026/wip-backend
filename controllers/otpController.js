import Joi from "joi"
import otpModel from "../model/otpModel";
import userModel from "../model/userModel.js";
const random = require('random-ext')
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import otpService from "../services/otpService.js";
const otpController = {
    async sendOtp(req, res, next) {
        try {
            console.log(req.body)
            console.log(req.rawHeaders[1])
            if (req.rawHeaders[1] != "localhost:5000") {
                return next(CustomErrorHandler.unAuthorised("Unuthorised Access "))

            }
            if (!req.body.mobileNo) {
                return next(CustomErrorHandler.invalidMobile())
            }
            const UserExist = await userModel.exists({ mobileNo: req.body.mobileNo }) // findout if user  mobile number is exists in user table
            console.log("exists", UserExist)
            if (UserExist) {
                return next(CustomErrorHandler.alreadyExists('Mobile Number already exists.'))
            }
            // // schema to send otp when user click on the send otp button 
            const sendOTPSchema = Joi.object({
                mobileNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
            });
            const { mobileNo } = req.body;
            const { error } = sendOTPSchema.validate(req.body);
            if (error) {
                return next(CustomErrorHandler.invalidMobile());
            }
            // check if user already in Databse 

            // to generate random 4 digit OTP

            const newOtp = random.restrictedString(
                [random.CHAR_TYPE.NUMERIC],
                4,
                4
            )
            const otpStatus = await otpService.sendOTP(req.body.mobileNo, newOtp)
            console.log(otpStatus)
            if (otpStatus.otp) {
                res.json({
                    type: "success",
                    message: "OTP send successfully !"
                })
            }
            else {
                res.json({ error: otpStatus })
            }
            // res.json({ "message": otpStatus })
            // res.send("done")
        } catch (error) {
            console.log(error)
        }
    }
    , async verifyOtp(req, res, next) {
        try {
            console.log(req.body)
            const verifyOtpSchema = Joi.object({

                mobileNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
                otp: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
            })
            const { error } = verifyOtpSchema.validate(req.body)
            if (error) {
                return next(CustomErrorHandler.invalidOtp(error));
            }
            console.log('before verify !')
            const verifyStatus = await otpService.verifyOTP(req.body.mobileNo, req.body.otp)
            console.log("In veriFy controller :", verifyStatus)
            res.json({ type: verifyStatus.type, "message": verifyStatus.message })
            // res.json({"m":"hi"})

        } catch (error) {
            return next(error)
        }
    }
}
export default otpController;