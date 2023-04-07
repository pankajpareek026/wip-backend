import Joi from "joi";
import depositModel from "../model/deposiModel.js";
import moment from 'moment';
import CustomErrorHandler from "../services/CustomErrorHandler.js";
import userModel from "../model/userModel.js";
import { mongoose } from "mongoose";
const depositController = {
    async deposit(req, res, next) {
        console.log(req.file)
        console.log(req.headers.user)
        req.body.user = req.headers.user
        req.body.screenshot = req.file.filename
        req.body.status = 'pending'
        try {
            const image_url = req.file.path
            const image = req.file.filename
            console.log(req)
            console.log("image :", image, "image URL :", image_url, 0)
            const { user, amount, coin, chain, deposit_id, transaction_id } = req.body
            const screenshot = req.file.filename;
            console.log("fileName:", screenshot);
            const depositSchema = Joi.object({
                user: Joi.string().required(),
                amount: Joi.number().min(20).required(),
                coin: Joi.string().required(),
                chain: Joi.string().required(),
                screenshot: Joi.string().required(),
                transaction_id: Joi.string().required(),
                deposit_id: Joi.string().required(),
                status: Joi.string().required(),
                explorer: Joi.string().required(),
                destination_address: Joi.string().required()

            })
            // console.log(req.body)
            // console.log(req.file)
            const { error } = depositSchema.validate(req.body)
            if (error) {
                console.log("ErroR :", error)
                return next(CustomErrorHandler.invalidInput(error))
            }
            console.log("Headers :", req.headers)
            // find user and update deposits
            const depositQuery = await userModel.updateOne({ _id: req.headers.user }, {
                $push: {
                    deposit: {
                        user_id: req.headers.user,
                        amount: parseInt(req.body.amount),
                        coin: req.body.coin,
                        chain: req.body.chain,
                        status: req.body.status,
                        screenshot: image,
                        transaction_id: req.body.transaction_id,
                        deposit_id: req.body.deposit_id,
                        image_url: image_url,
                        destination_address: req.body.destination_address,
                        explorer: req.body.explorer,
                        date: moment().locale('en-in').format('lll')
                    }
                }
            })
            console.log("deposit data:", depositQuery)
            // if transaction Not submited succesfully in user's deposit array
            if (depositQuery.modifiedCount !== 1) {
                console.log("deposit quiery :", depositQuery)
                return next(CustomErrorHandler.whentWrong())
            }
            //if transaction submited succesfully in user's deposit array
            const adminDeposit = await depositModel({
                user_id: req.headers.user,
                amount: req.body.amount,
                fees: parseFloat(((amount * 2.5) / 100)).toFixed(2),
                coin: req.body.coin,
                chain: req.body.chain,
                status: req.body.status,
                screenshot: image,
                transaction_id: req.body.transaction_id,
                deposit_id: req.body.deposit_id,
                image_url: image_url,
                explorer: req.body.explorer,
                destination_address: req.body.destination_address,
                date: moment().locale('en-in').format('lll'),
                actual_amount: parseFloat(amount - ((amount * 2.5) / 100)).toFixed(1)
            })
            const adminDepositResult = await adminDeposit.save()
            console.log("admin Result :", adminDepositResult)
            //if transaction not  submited succesfully in admin's deposit table
            if (!adminDepositResult.id) {
                console.log("admin deposit result")
                return next(CustomErrorHandler.whentWrong())
            }
            //if transaction not  submited succesfully in admin's deposit table
            res.json({
                type: 'success',
                message: 'deposit request submited successfully  amount will be reflected in your account within 24 Hours .',
                deposit_id: req.body.deposit_id,
                date: moment().locale('en-in').format('lll')
            })
        } catch (error) {
            console.log(error)
            return next(error)
        }
    }


    , async depositTransactionStatus(req, res, next) {
        console.log('called @@')
        try {
            console.log(req.body.deposit_id)
            const { deposit_id, user } = req.body
            console.log(req.body.user)
            const depositTransaction = Joi.object({
                user: Joi.string().required(),
                deposit_id: Joi.string().length(15).required()
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
                                'input': '$deposit',
                                'as': 'deposit',
                                'cond': {
                                    '$eq': [
                                        '$$deposit.deposit_id', deposit_id
                                    ]
                                }
                            }
                        }
                    }
                }
            ])
            console.log(0, 'Depsit Transaction Result :', transactionDetail[0].detail[0].status)
            if (!transactionDetail.deposit_id === deposit_id) {
                return next(CustomErrorHandler.whentWrong())

            }
            const messages = {
                pending: "Transaction confirmation can take time upto 24 Hours.Thankyou For your patience!",
                success: "Deposit Accepted Please visit Dashboard Page !",
                rejected: "Transaction Rejected due to bad practices . for more details please contact to support !"
            }
            // console.log("status :", transactionDetail.detail[0])
            const sts = transactionDetail[0].detail[0].status
            console.log("Statusssssssssss :", sts)
            res.json({
                type: 'success',
                message: sts === 'success' ? messages.success : sts === 'pending' ? messages.pending : sts === 'rejected' ? messages.rejected : "Deposit under process",
                deposit_id: transactionDetail[0].detail[0].deposit_id,
                coin: transactionDetail[0].detail[0].coin,
                date: transactionDetail[0].detail[0].date,
                chain: transactionDetail[0].detail[0].chain,
                status: transactionDetail[0].detail[0].status,
                amount: transactionDetail[0].detail[0].amount,
                transaction_id: transactionDetail[0].detail[0].transaction_id,
                actual_amount: transactionDetail[0].detail[0].actual_amount,
                fees: parseFloat(transactionDetail[0].detail[0].actual_amount).toFixed(1),

                // , Go: "dflksdfjklsjlj"
            })
            // console.log(1, 'Depsit Transaction Result :', transactionDetail)
        } catch (error) {
            console.log("Catch Error :", error)
        }
    }

}

export default depositController;