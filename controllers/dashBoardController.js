// import { auth } from "../middlewares"
import mongoose from "mongoose"
import userModel from "../model/userModel"
import CustomErrorHandler from "../services/CustomErrorHandler"
import buyedplanModel from "../model/buyedPlanModel"

const dashBoardController = {
    async getUserDashboardData(req, res, next) {
        let userId = req.body.user
        userId = mongoose.Types.ObjectId(userId)
        // console.log(userId)
        // const userData = await userModel.find({ _id: userId })
        const userData = await userModel.aggregate([
            {
                '$match': {
                    '_id': userId,
                }
            }, {
                '$project': {
                    'username': 1,
                    'balance': 1,
                    'earning_balance': 1,
                    'earnings': 1,
                    'deposit': 1,
                    'deposits': {
                        '$filter': {
                            'input': '$deposit',
                            'as': 'deposit',
                            'cond': {
                                '$eq': [
                                    '$$deposit.status', 'success'
                                ]
                            }
                        }
                    },
                    'plans': {
                        '$filter': {
                            'input': '$plan',
                            'as': 'plan',
                            'cond': {
                                '$eq': [
                                    '$$plan.status', 'active'
                                ]
                            }
                        }
                    },
                    'withdraws': {
                        '$filter': {
                            'input': '$withdraw',
                            'as': 'withdraw',
                            'cond': {
                                '$eq': [
                                    '$$withdraw.status', 'success'
                                ]
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    'username': 1,
                    'balance': 1,
                    'plans': 1,
                    'earning_balance': 1,
                    'total_deposits': {
                        '$sum': '$deposit.amount'
                    },
                    'total_withdrawls': {
                        '$sum': '$withdraws.amount'
                    },
                    'total_earnings': {
                        '$sum': '$earnings.my_earning'
                    }
                }
            }
        ])
        // console.log("Plans :", userData[0].plans)
        res.json({
            type: 'success',
            balance: parseFloat(userData[0].balance).toFixed(2),
            withdtrawls: userData[0].total_withdrawls,
            deposits: parseFloat(userData[0].total_deposits).toFixed(2),
            earnings: parseFloat(userData[0].total_earnings).toFixed(2),
            earning_balance: parseFloat(userData[0].earning_balance).toFixed(1),
            username: userData[0].username,
            active_plans: userData[0].plans


        })

    },
    async getBalance(req, res, next) {
        try {
            const _id = req.body.user
            // console.log("userId :", _id)
            if (!_id) {
                return next(CustomErrorHandler.whentWrong())
            }
            const userData = await userModel.findOne({ _id })
            // console.log("UserBalance:", userData.earning_balance)
            res.json({
                type: 'success',
                balance: parseFloat(userData.earning_balance).toFixed(1)
            })

        } catch (error) {
            console.log("Catch Errors :", error)
        }
    },
    async getActiveplans(req, res, next) {
        try {
            const _id = req.body.user
            console.log("userId :", _id)
            if (!_id) {
                return next(CustomErrorHandler.whentWrong())
            }
            const userData = await buyedplanModel.aggregate(
                [
                    {
                        '$match': {
                            '$and': [
                                {
                                    'user_id': _id
                                }, {
                                    'status': 'active'
                                }
                            ]
                        }
                    }
                ]
            )
            console.log("UserBalance:", userData)

            const dailyEarnings = userData.map((item) => {
                return item.daily_earning
            })
            const investment = userData.map((item) => {
                return item.investment_amount
            })
            let totalInvestment=0
            for (let amout of investment) {
                totalInvestment = totalInvestment + amout
                console.log('investment :', amout)
            }
            let totalDailyEarning = 0
            for (let earing of dailyEarnings) {
                totalDailyEarning = totalDailyEarning + earing
                // console.log('Earning :', earing)
            }
            console.log("Daily Earning :", totalDailyEarning)
            res.json({
                type: 'success',
                plans: userData,
                totalDailyEarning, totalInvestment
            })

        } catch (error) {
            console.log("Catch Errors :", error)
        }

    }

}


export default dashBoardController;