import e from "express";
import Joi from "joi";
const bcrypt = require('bcrypt');
import userModel from "../model/userModel.js";
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import JwtService from "../services/jwtService.js";
const registerController = {
    async register(req, res, next) {
        // console.log(req.body)
        const password_ = req.body.password
        const { username, mobileNo, password, refferal_code, invitee } = req.body
        try {
            const registerSchema = Joi.object({
                username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,30}$')).required(),
                mobileNo: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
                otp: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
                password: Joi.string().min(8).max(15).required(),
                repassword: Joi.equal(password_).required(),
                refferal_code: Joi.string().length(5).pattern(new RegExp(/^[a-z]+$/)),
                invitee: Joi.string().required()

            })
            // console.log(req.body)

            const { error } = registerSchema.validate(req.body);
            if (error) {
                console.log(error.message)
                error.message = error.message.replaceAll("\"", " ")
                return next(CustomErrorHandler.invalidInput(error.message))
            }

            const userNameExist = await userModel.exists({ username: req.body.username })
            if (userNameExist) {
                console.log(userNameExist)
                return next(CustomErrorHandler.alreadyExists(" username Already exist !"));
            }
            const mobileNoExist = await userModel.exists({ mobileNo: req.body.mobileNo })
            if (mobileNoExist) {
                console.log(mobileNoExist)
                return next(CustomErrorHandler.alreadyExists(" This Number Already exist !"));
            }
            const invalidReffer = await userModel.findOne({ refferal_code: req.body.invitee })
            // console.log("invalid reffer :", invalidReffer)
            if (invalidReffer == null) {
                return next(CustomErrorHandler.invalidInviteCode("Invalid Refferal code !"))
            }

            // res.json({ "response": req.body })
            const enctyptedPassword = await bcrypt.hash(password, 10)


            // res.send(enctyptedPassword)
            const result = await new userModel({ username, mobileNo, password: enctyptedPassword, refferal_code, invitee })
            console.log("before save")
            let newUserStatus = await result.save()
            console.log("After  save")
            console.log("new Usser:", newUserStatus)
            if (newUserStatus.user_status == "active") {
                console.log("if colled !")
                const addReffer = await userModel.updateOne({ refferal_code: req.body.invitee }, {
                    "$push": {
                        refferals: {
                            name: newUserStatus.username,
                            date: new Date(),
                            earning: 0,
                        }
                    }
                })
                if (addReffer.modifiedCount == 1) {
                    console.log(addReffer.modifiedCount)
                    const jwtTocken = await JwtService.sign({ _id: newUserStatus._id, status: newUserStatus.status })
                    res.cookie("Auth0", `${jwtTocken}`, {
                        // expires works the same as the maxAge
                        expires: new Date(Date.now() + 2629746000),
                        secure: true,
                        httpOnly: true,
                        
                    }).json({ type: "success", message: "Registration Successfull !", "Auth0": jwtTocken })

                }
                else {
                    res.json({
                        type: "error",
                        message: "something went wrong !"
                    })
                }


            }


        } catch (error) {
            return next(error)
        }
    }
}

export default  registerController;