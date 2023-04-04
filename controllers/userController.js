import userModel from "../model/userModel"
import CustomErrorHandler from "../services/CustomErrorHandler"

const userController = {
    async getUserInfo(req, res, next) {
        console.log("user controller hitted",0)
        try {
            const { user } = req.body
            const userInfo =await  userModel.findOne({ _id: user })
            if (!userInfo._id) {
                return next(CustomErrorHandler.whentWrong())
            }
           const{balance,username,mobileNo}=userInfo

            // balance: 50,
            //     username: 'parek',
            //         mobileNo: 8966523365,

console.log(userInfo)
            res.json({
                balance, username, mobileNo,type:'success'
            })
        } catch (error) {

        }
    }
}
export default userController