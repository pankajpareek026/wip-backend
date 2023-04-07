import Joi from "joi";
import bcypt from 'bcrypt'
import userModel from "../model/userModel.js";
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import JwtService from "../services/jwtService.js";
const loginController = {
    async login(req, res, next) {
        // 
        const loginSchema = Joi.object(
            {
                username: Joi.string().required(),
                password: Joi.string().required(),
            }
        )
        const { error } = loginSchema.validate(req.body)
        if (error) {
            error.message = error.message.replaceAll("\"", " ")
            return next(CustomErrorHandler.invalidInput(error.message))
        }
        // fond user in databse using mobile No.

        try {
            const user = await userModel.findOne({ username: req.body.username })
            const password = req.body.password;
            if (!user) {
                console.log(user)
                return next(CustomErrorHandler.notExists("user does not exists ! "))

            }
            const matchPassword = await bcypt.compare(password, user.password) // to compare password 
            if (!matchPassword) {
                return next(CustomErrorHandler.wrongCredentials("Invalid password "))
            }
            if (user.user_status == "active") {

                const jwtTocken = await JwtService.sign({ _id: user._id, status: user.status })
                res.cookie("Auth0", `${jwtTocken}`, {

                    // expires works the same as the maxAge
                    expires: new Date(Date.now() + 2629746000),
                    secure: true,
                    httpOnly: true,

                }).json({
                    "type": "success",
                    "message": "Login successfully"
                    , 'Auth0': jwtTocken
                })
            }

            //    console.log("match password",matchPassword)



            //            res.json({
            // type:"success",
            // message:'login Successfully !',user
            //            })
            // JwtService.sign()
        } catch (error) {
            return next(error)
        }

    }
    , async logout(req,res,next){
        
        console.log("logout called",req.boy)
    const findUser=await userModel.findOne({_id:req.body.user})
    if(findUser._id)
    {
        res.clearCookie('Auth0').json({type:'success', message: "logged out successfully !" })
    }
    }
}
export default loginController;