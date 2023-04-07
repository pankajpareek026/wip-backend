
import userModel from "../model/userModel.js"
import CustomErrorHandler from "../services/CustomErrorHandler.js"
const transactionsController = {

    async getWithdrawls(req, res, next) {
        // console.log(req.body)
        if (!req.body.user) { return next(CustomErrorHandler.badRequest()) }


        const wdata = await userModel.findOne({ _id: req.body.user })
        res.send({
            type: 'success',
            deposits: wdata.deposit,
            withdraw: wdata.withdraw
        })
        console.log(wdata)

    }

}
export default transactionsController