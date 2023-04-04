import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/jwtService";
const auth = async (req, res, next) => {

    console.log(0,'Auth called !')
    const authCookie = req.cookies.Auth0
    const authHeader = req.headers.auth0
    //    const result=JwtService.verify(req.cookeie)
    // console.log("auth cookie:", req.cookies.Auth0)
    console.log(1,"verified At AUTH : =>", req.headers.auth0 === authCookie)
    if ((authCookie && authHeader) && (authCookie === authHeader)) {
        try {
            const result = JwtService.verify(authCookie)
            // console.log("Jwt in AUTH", result)
            if (result._id) {
                req.body.user = result._id;
                req.headers.user = result._id;
                // console.log("ID at auth middleware", result._id)
                next()
            }
        } catch (error) {
            console.log(2,"Catch Error :", error.message)
            if (error.message === "jwt expired") {
                console.log(3,"auth Error Line 22 :", error)

                next(CustomErrorHandler.tokenExpired("session expired"))
                res.clearCookie('Auth0')
            }
            console.log("next error", error)
          return next(error)
           
        }
    }
    else {

        next(CustomErrorHandler.tokenExpired("session expired"));
    }
}
export default auth