import userModel from "../model/userModel.js";
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import JwtService from "../services/jwtService.js";
const authController = async (req, res, next) => {
    const authCookie = req.cookies.Auth0
    const authHeader = req.headers.auth0
    // console.log("auth controller is colled !")
    //    const result=JwtService.verify(req.cookeie)
    // console.log("deposit cookie:", req.cookies.Auth0)
    // console.log("deposit Header:", req.headers.auth0)
    // console.log("result :", authCookie == authHeader)
    if ((authCookie && authHeader) && (authCookie == authHeader)) {
        try {
            const result = JwtService.verify(authCookie)
            // console.log("Jwt in AUTH controller", result)
            if (result._id) {
                // console.log('inside try block =>')
                // console.log("id found :",result._id)
                const user = await userModel.findOne({ _id: result._id })
                if (user == null) {
                    res.clearCookie('Auth0').json({ message: "fail" })
                    return
                }

                // console.log("userstatus /USER:", user)
                if (user.user_status == 'active' || user._id == result._id) {

                    // console.log("userstatus :", user.user_status)
                    req.user = result._id;
                    res.json({ message: "success" })
                    return
                } else {
                    res.clearCookie('Auth0').json({ message: "fail" })
                }


            }
            else {
                res.clearCookie('Auth0').json({ message: "fail" })
                return
            }
        } catch (error) {
            // console.log(error.message)
            if (error.message == "jwt expired") {
                console.log("expired")
                next(CustomErrorHandler.tokenExpired("session expired"))
                res.clearCookie('Auth0').json({ message: "fail" })
            }
            // next(error)
        }
    }
    else {
        // console.log("else in authcontroller")
        res.clearCookie('Auth0').json({ message: 'fail' })
    }
}
export default authController;