import Joi from "joi"
import depositModel from "../model/deposiModel"
import userModel from "../model/userModel"
import withdrawModel from "../model/withdrawModel"
import CustomErrorHandler from "../services/CustomErrorHandler"
const adminControllers = {
    async adminGetPendingDeposits(req, res, next) {
        try {
            const data = await depositModel.find({ status: "pending" })
            if (!data) {
                res.json({
                    messagge: 'data not found',
                    type: "success"
                })
            }
            // console.log('deposit :', data)
            res.json({
                source: 'deposit',
                data
            })
        } catch (error) {
            res.send(error)
        }

    }
    , async adminGetPendingWithdrawls(req, res, next) {
        try {
            const data = await withdrawModel.find({ status: "pending" })
            // console.log('withdraw :', data)
            if (!data) {
                res.json({
                    messagge: 'data not found',

                    type: "success"
                })
            }
            res.json({
                source: 'withdraw',
                data
            })
        } catch (error) {
            res.send(error)
        }
    }
    ,
    // confirm deposit transaction // process deposit transaction 

    async processDepositTransaction(req, res, next) {
        try {
            const { deposit_id, requst_type, user_id, status } = req.body
            // validate user request data ..... start
            const transactionSchema = Joi.object({
                deposit_id: Joi.string().length(15).required(),
                user_id: Joi.string().required(),
                status: Joi.string().required(),
                requst_type: Joi.string().required(),

            })
            const { error } = transactionSchema.validate(req.body)
            if (error) {
                return next(CustomErrorHandler.invalidInput(error.message))
            } // validate user request data ..... end 

            // find user data by userid and depositid to get deposit amount
            const findDepositAmount = await depositModel.findOne({ user_id, deposit_id })
            const findUser = await userModel.findOne({ _id: user_id }) // find user name in from user table with help of the _id ..... to update balance of ininvitee 's table
            const depositAMT = findDepositAmount.actual_amount  //asign deposit amount to  variable
            const username = findUser.username // username of the user who send the deposit request 
            const invitee = findUser.invitee // invitee of the deposit request user to update the blance of invitee ,when deposit successfully 
            const inviteeEarning = parseFloat((depositAMT * 10) / 100)
            const actual_amount = parseFloat((depositAMT * 2.5) / 100)
            console.log('username :', username, "deposit amt:", depositAMT, "invitee :", invitee, "invitee Earning :", inviteeEarning, "userid :", user_id)
            // update deposit request in deposit table at admin side
            const editAdminDeposit = await depositModel.updateOne({
                user_id, deposit_id
            }, {
                $set: { status: status }
            })
            console.log("ADMIN DEPOSIT update result :", 0, editAdminDeposit)
            if (editAdminDeposit.modifiedCount === 0) { // id deposit updated faild at  admin side
                // console.log('edit admin deposit', 0, editAdminDeposit,)
                return next(CustomErrorHandler.notFound('Deposit Transaction Not Found !'))
            }
            //if deposit successfull in deposit table / at admin sidr


            // update deposit data  from user side in deposit array 
            const editUserDeposit = await userModel.updateOne({ "deposit.deposit_id": deposit_id }, {
                $set: {
                    "deposit.$.status": status
                }
            })
            // console.log("A :", a)
            console.log("user DEPOSIT update result :", 1, editUserDeposit)
            //satatus is rejected

            if (status === 'rejected') {
                res.json({
                    type: "success",
                    message: `last transaction was ${status}  successfull !`
                })
                return
            }
            // id deposit successfully updated at user side 
            //then update balance of user according to deposit amount
            console.log('110101')
            const updateUserBalance = await userModel.updateOne({ _id: user_id }, {
                $inc: {
                    balance: +actual_amount
                }
            })
            console.log("update user balance  result :", 2, updateUserBalance)
            if (updateUserBalance.modifiedCount === 1) // if balance user balance updated successfully 
            {  //update balance of invitee and push earning infomation in eatning array 
                const findInvitee = await userModel.findOne({ refferal_code: invitee }) // find invitee by refferal code
                // update earning  balance and earning arrray of the invitee 
                const updateInviteesBalance = await userModel.updateOne({
                    _id: findInvitee._id
                }, {
                    $inc: {
                        earning_balance: +inviteeEarning
                    },
                    $push: {
                        earnings: {
                            discryption: "refferal income",
                            deposit_amout: depositAMT,
                            my_earning: parseFloat(inviteeEarning),
                            user: username,
                            time: new Date().toLocaleDateString()
                        }
                    }
                })
                console.log(" update updateInviteesBalance result :", 3, updateInviteesBalance)
                if (updateInviteesBalance.modifiedCount === 1) {
                    const setDepositAmountAndEarningInRefferalsArray = await userModel.updateOne({
                        "refferals.name": username

                    }, {
                        $inc: {
                            'refferals.$.earning': +inviteeEarning
                        }
                    })
                    console.log(" update setDepositAmountAndEarningInRefferalsArray result :", 4, updateInviteesBalance)
                    if (setDepositAmountAndEarningInRefferalsArray.modifiedCount === 1) {
                        res.json({
                            type: "success",
                            message: `last transaction was ${requst_type}  successfull !`
                        })
                    }
                }

            }



        } catch (error) {
            return next(error)
        }
    }
    ,
    /// to processs withdrawal requests
    async processWithdrawTransaction(req, res, next) {

        console.log(req.body)
        try {
            const { withdraw_id, requst_type, amount, transaction_id, user_id, status } = req.body
            // validate user request data ..... start
            const transactionSchema = Joi.object({
                withdraw_id: Joi.string().length(15).required(),
                user_id: Joi.string().required(),
                status: Joi.string().required(),
                transaction_id: Joi.string().required(),
                requst_type: Joi.string().required(),
                amount: Joi.number().required(),
            })
            const { error } = transactionSchema.validate(req.body)
            if (error) {
                console.log('validation error :', error)
                return next(CustomErrorHandler.invalidInput(error.message))
            } // validate user request data ..... end 

            //  find user and get earning_balance and locked balance
            const userData = await userModel.findOne({ _id: user_id })
            const earningBalance = userData.earning_balance;
            const lockedBalance = userData.locked_balance;
            console.log(0, ': userData fetched  ... earning balance :', earningBalance, "locked balance :", lockedBalance)
            // fetch withdraw data and store withdraw amount
            const withdrawData = await withdrawModel.find({ withdraw_id: withdraw_id })
            const withdraAmount = withdrawData.amount
            console.log(1, ': withdra fetched  withdra Data : Done', "amount :", withdraAmount)

            const updateWithdraTable = await withdrawModel.updateOne({ withdraw_id: withdraw_id }, {
                $set: { status: status, transaction_id: transaction_id }
            })
            console.log(3, " result of updateWithdraTable", updateWithdraTable)
            // set status and transction id in user withdra array
            if (updateWithdraTable.matchedCount == 1) {
                const updateUsersWithdrawArray = await userModel.updateOne({ "withdraw.withdraw_id": withdraw_id }, {
                    $set: {
                        "withdraw.$.transaction_id": transaction_id,
                        "withdraw.$.status": status,
                    }

                })
                console.log(1, ': result of updateUsersWithdrawArray :', updateUsersWithdrawArray)
                if (updateUsersWithdrawArray.modifiedCount == 1) {
                    if (status == 'rejected') {
                        // release locked balance and update earning balance
                        const updateErningAndLockedBalance = await userModel.updateOne({ _id: user_id },
                            {
                                $inc: {
                                    locked_balance: -amount,
                                    earning_balance: +amount
                                }
                            })
                        console.log(2, ': result of updateErningAndLockedBalance => ', updateErningAndLockedBalance)
                        if (updateErningAndLockedBalance.modifiedCount == 1) {
                            res.json({
                                type: 'success',
                                message: `last transaction with Amount :${amount} was "Rejected"  successfully !`
                            })
                        }

                    }
                }

                // update locked balance 
                const updateLockedBlanceAfterSuccessTransaction = await userModel.updateOne({ _id: user_id }, {
                    $inc: { locked_balance: -amount }
                })
                console.log(3, 'result of  updateLockedBlanceAfterSuccessTransaction =>', updateLockedBlanceAfterSuccessTransaction)
                if (updateLockedBlanceAfterSuccessTransaction.modifiedCount == 1) {
                    res.json({
                        type: 'success',
                        message: `last transaction with Amount :${amount} was Confirmed   successfully !`
                    })
                }
            }






        } catch (error) {
            console.log('catch error :', error)
            return next(error)

        }
    }
}
export default adminControllers












// import Joi from "joi"
// import depositModel from "../model/deposiModel"
// import userModel from "../model/userModel"
// import withdrawModel from "../model/withdrawModel"
// import CustomErrorHandler from "../services/CustomErrorHandler"
// const adminControllers = {
//     async adminGetPendingDeposits(req, res, next) {
//         try {
//             const data = await depositModel.find({ status: "pending" })
//             if (!data) {
//                 res.json({
//                     messagge: 'data not found',
//                     type: "success"
//                 })
//             }
//             console.log('deposit :', data)
//             res.json({
//                 source: 'deposit',
//                 data
//             })
//         } catch (error) {
//             res.send(error)
//         }

//     }
//     , async adminGetPendingWithdrawls(req, res, next) {
//         try {
//             const data = await withdrawModel.find({ status: "pending" })
//             console.log('withdraw :', data)
//             if (!data) {
//                 res.json({
//                     messagge: 'data not found',

//                     type: "success"
//                 })
//             }
//             res.json({
//                 source: 'withdraw',
//                 data
//             })
//         } catch (error) {
//             res.send(error)
//         }
//     }
//     ,
//     // confirm deposit transaction // process deposit transaction

//     async processDepositTransaction(req, res, next) {
//         try {
//             const { deposit_id, requst_type, user_id, status } = req.body
//             // validate user request data ..... start
//             const transactionSchema = Joi.object({
//                 deposit_id: Joi.string().length(15).required(),
//                 user_id: Joi.string().required(),
//                 status: Joi.string().required(),
//                 requst_type: Joi.string().required(),

//             })
//             const { error } = transactionSchema.validate(req.body)
//             if (error) {
//                 return next(CustomErrorHandler.invalidInput(error.message))
//             } // validate user request data ..... end

//             // find user data by userid and depositid to get deposit amount
//             const findDepositAmount = await depositModel.findOne({ user_id, deposit_id })
//             const findUser = await userModel.findOne({ _id: user_id }) // find user name in from user table with help of the _id ..... to update balance of ininvitee 's table


//             const depositAMT = findDepositAmount.amount  //asign deposit amount to  variable
//             const username = findUser.username // username of the user who send the deposit request
//             const invitee = findUser.invitee // invitee of the deposit request user to update the blance of invitee ,when deposit successfully
//             console.log('username :', username)
//             const editAdminDeposit = await depositModel.updateOne({
//                 user_id, deposit_id
//             }, {
//                 $set: { status: status }
//             })
//             console.log("ADMIN DEPOSIT :", editAdminDeposit)
//             if (editAdminDeposit.modifiedCount == 0) {
//                 console.log('edit admin deposit', 0, editAdminDeposit,)
//                 return next(CustomErrorHandler.notFound('Deposit Transaction Not Found !'))

//             }
//             //if deposit successfull in deposit table
//             if (editAdminDeposit.modifiedCount == 1) {
//                 console.log("if count !")
//                 // const a = await userModel.findOne({ "deposit.deposit_id": deposit_id })
//                 // console.log(a)
//                 const editUserDeposit = await userModel.updateOne({ "deposit.deposit_id": deposit_id }, {
//                     $set: {
//                         "deposit.$.status": status
//                     }
//                 })
//                 // console.log("A :", a)
//                 console
//                 if (editAdminDeposit.modifiedCount == 1) {
//                     const updateUserBalance = await userModel.find({ _id: user_id }, {
//                         $inc: {
//                             balance: -depositAMT
//                         }
//                     })
//                     if (updateUserBalance.modifiedCount == 1) {
//                         const updateDepositInInviteesBalance = await userModel.findOne({ username:})
//                     }
//                 }

//                 // res.json({Response:a})
//             }
//             // const a = await userModel.aggregate([
//             //     { $match: { "deposit.deposit_id": deposit_id, } },
//             //     {
//             //         $project: {
//             //             "deposit": {
//             //                 $filter: {
//             //                     input: "$deposit",
//             //                     as: "deposit",
//             //                     cond: { $eq: ["$$deposit.deposit_id", deposit_id] }
//             //                 }
//             //             }
//             //         }
//             //     }
//             // ])
//             // const a = await userModel.find({
//             //     deposit: { $eleMatch: { "deposit_id": deposit_id } }
//             // })
//             // console.log(a)
//             // res.json({ Response: a })
//         } catch (error) {
//             return next(error)
//         }
//     }
// }
// export default adminControllers