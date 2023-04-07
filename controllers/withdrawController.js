import Joi from 'joi';
import moment from 'moment';
import userModel from '../model/userModel.js';
import withdrawModel from '../model/withdrawModel.js';
import mongoose from 'mongoose';
import CustomErrorHandler from '../services/CustomErrorHandler.js';
const print = console.log

// control wothdrowls request
const withdrawController = {
    async submitWithdrawlRequest(req, res, next) {
        print(req.body)
        try {
            const withdrawSchema = Joi.object({
                user: Joi.string().required(),
                amount: Joi.number().min(20).required(),
                chain: Joi.string().required(),
                coin: Joi.string().required(),
                address: Joi.string().required(),
                status: Joi.string().required(),
                withdraw_id: Joi.string().length(15).required()

            })
            const { error } = withdrawSchema.validate(req.body);
            if (error) {
                console.log("Joi validation Error :", error);
                return next(CustomErrorHandler.invalidInput("all fiels are required "))
            }
            //fetch user balance
            const userData = await userModel.findOne({ _id: req.body.user })
            console.log("userdata parsse", userData)
            if (userData.user_status !== "active") {
                console.log("userData Query Result :", userData)
                return next(CustomErrorHandler.whentWrong())
            }
            // if user balance is lower then request amount 
            if (userData.earning_balance < req.body.amount) {
                print('usedata in if condition ', userData)
                return next(CustomErrorHandler.insufficientBalance())
            }
            // insert request in withdraw array 
            const lockedBalance = userData.locked_balance
            const withdrawQuery = await userModel.updateOne(
                {
                    _id: req.body.user
                }, {
                $push: {
                    withdraw: {
                        user_id: req.body.user,
                        amount: parseFloat(req.body.amount),
                        chain: req.body.chain,
                        coin: req.body.coin,
                        address: req.body.address,
                        status: req.body.status,
                        date: moment().locale('en-in').format('lll'),
                        withdraw_id: req.body.withdraw_id,
                        transaction_id: "null",
                        default: Date.now(),
                        actual_amount: parseFloat((req.body.amount * 2.5) / 100).toFixed(1)
                    }
                }, $set: {
                    earning_balance: parseFloat(userData.earning_balance - req.body.amount),
                    locked_balance: parseFloat(lockedBalance + req.body.amount)
                }
            })
            if (withdrawQuery.modifiedCount !== 1) {
                print("withdrawQuery result :", withdrawQuery)
                return next(CustomErrorHandler.whentWrong());
            }
            const adminWithdrawQuery = await withdrawModel({
                user_id: req.body.user,
                amount: parseFloat(req.body.amount).toFixed(1),
                chain: req.body.chain,
                coin: req.body.coin,
                address: req.body.address,
                status: req.body.status,
                date: moment().locale('en-in').format('lll'),
                withdraw_id: req.body.withdraw_id,
                transaction_id: 'null',
                actual_amount: parseFloat(req.body.amount - (req.body.amount * 2.5) / 100).toFixed(1)
            })
            const adminWithdrawQueryResult = await adminWithdrawQuery.save()
            if (!adminWithdrawQueryResult._id) {
                console.log("adminWithdrawQueryResult Query Result :", adminWithdrawQueryResult)
                return next(CustomErrorHandler.whentWrong())
            }
            res.json({
                type: 'success',
                message: 'withdraw request submited successfully amount will be reflected in your account within 24 Hours .',
                withdraw_id: req.body.withdraw_id,
                date: moment().locale('en-in').format('lll')
            })

        } catch (error) {
            return next(error)
        }
    },
    // to get the detail of indivisult transaction by withdrawid
    async withdrawTransactionStatus(req, res, next) {
        console.log('called @@')
        try {
            console.log(req.body.deposit_id)
            const { withdraw_id, user } = req.body
            console.log(req.body.user)
            const depositTransaction = Joi.object({
                user: Joi.string().required(),
                withdraw_id: Joi.string().length(15).required()
            })
            const { error } = depositTransaction.validate(req.body)
            if (error) {
                console.log("input Error deposit controller :", error)
                return next(CustomErrorHandler.invalidInput(error.message))
            }
            const Id = mongoose.Types.ObjectId(user)
            const transactionDetail = await userModel.aggregate([
                {
                    '$match': {
                        '_id': Id
                    }
                }, {
                    '$project': {
                        'detail': {
                            '$filter': {
                                'input': '$withdraw',
                                'as': 'withdraw',
                                'cond': {
                                    '$eq': [
                                        '$$withdraw.withdraw_id', withdraw_id
                                    ]
                                }
                            }
                        }
                    }
                }
            ])
            console.log(0, 'Depsit Transaction Result :', transactionDetail)
            if (!transactionDetail.withdraw_id === withdraw_id) {
                return next(CustomErrorHandler.whentWrong())

            }
            const messages = {
                pending: "Withdraw can take time upto 24 Hours.Thankyou For your patience!",
                success: "withdraw processed  processed please check your respected walle / account !",
                rejected: "Transaction Rejected due to bad practices . for more details please contact to support !"
            }
            // console.log("status :", transactionDetail.detail[0])
            const sts = transactionDetail[0].detail[0].status
            console.log("Statusssssssssss :", sts)
            res.json({
                type: 'success',
                message: sts === 'success' ? messages.success : sts === 'pending' ? messages.pending : sts === 'rejected' ? messages.rejected : "Deposit under process",
                withdraw_id: transactionDetail[0].detail[0].withdraw_id,
                coin: transactionDetail[0].detail[0].coin,
                date: transactionDetail[0].detail[0].date,
                chain: transactionDetail[0].detail[0].chain,
                status: transactionDetail[0].detail[0].status,
                amount: transactionDetail[0].detail[0].amount,
                actual_amount: transactionDetail[0].detail[0].actual_amount,
                fees: parseFloat(transactionDetail[0].detail[0].amount - transactionDetail[0].detail[0].actual_amount).toFixed(1),
                // transaction_id: transactionDetail[0].detail[0].transaction_id,
            })
            console.log(1, 'Depsit Transaction Result :', transactionDetail)
        } catch (error) {
            console.log("Catch Error :", error)
        }
    }

}
export default withdrawController;