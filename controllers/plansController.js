import Joi from "joi"
import buyedplanModel from "../model/buyedPlanModel"
import planModel from "../model/planModel"
import userModel from "../model/userModel"
import moment from 'moment'
import CustomErrorHandler from "../services/CustomErrorHandler"

const plansController = {
    async getPlans(req, res, next) {
        try {
            const planQuery = await planModel.find({})
            res.json({ message: 'success', data: planQuery })
        } catch (error) {
            next(CustomErrorHandler.whentWrong())
        }

    },
    //add plan
    async addPlan(req, res, next) {
        try {
            const addplanSchema = Joi.object({
                plan_name: Joi.string().required(),
                investment_amount: Joi.number().required(),
                roi: Joi.number().required(),
                duration: Joi.number().required(),
                status: Joi.string().required(),
                img: Joi.string().required(),
                daily_earning: Joi.number().required(),

            })
            const { error } = addplanSchema.validate(req.body)
            if (error) {
                return next(CustomErrorHandler.invalidInput(error))
            }
            const query = await planModel(req.body)
            const queryResult = await query.save()
            if (queryResult._id) {
                res.json({ messge: 'success', queryResult })
            }
            else {
                return next(CustomErrorHandler.whentWrong())
            }
        } catch (error) {
            return next(CustomErrorHandler.whentWrong())
        }
    }

    //update plan  .......... START

    , async updatePlan(req, res, next) {
        try {
            const updatePlanSchema = Joi.object({
                _id: Joi.string().required(),
            })
            const { error } = updatePlanSchema.validate(req.body)
            if (error) {
                return next(CustomErrorHandler.invalidInput(error))
            }

            // const query = await planModel.updateOne({ _id: req.body.id }, {
            //     '$set': {}
            // })
            // console.log(query)
            res.json({ message: 'success' })
        } catch (error) {
            return next(CustomErrorHandler.whentWrong())
        }
    }
    // .............  END
    ,
    //delete plan
    async deletePlan(req, res, next) {
        const deleteSchema = Joi.object({
            _id: Joi.string().required(),
        })
        const { error } = deleteSchema.validate(req.body)
        if (error) {
            return next(CustomErrorHandler.invalidInput(error))
        }
        const query = await planModel.deleteOne({ _id: req.body._id })
        if (query) {
            res.json({ "message": "success" })
        }

    }

    ,
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /* ................................................................................................
    ************************************************************************************************************* */
    async buyPlan(req, res, next) {

        try {
            const buyplanSchema = Joi.object({
                user: Joi.string().required(),
                plan_id: Joi.string().required()
            })
            const { error } = buyplanSchema.validate(req.body)
            if (error) {
                return next(CustomErrorHandler.invalidInput(error))
            }
            // get plandetails by plan id 
            const plan = await planModel.findOne({ _id: req.body.plan_id })
            // console.log("plan Price :", plan.investment_amount)
            if (!plan) {
                console.log("error At buy plan :", error)
                return next(CustomErrorHandler.invalidInput(error))

            }
            // store investment value or plan price
            const planInvestment = plan.investment_amount
            // console.log('plan info :', plan)
            // console.log("investment amount :", plan.investment_amount)
            // find user by _id from users table
            const userInfo = await userModel.findOne({ _id: req.body.user })
            // console.log('use Info :', userInfo)
            if (userInfo._id != req.body.user) {
                // console.log("error at fetching user Info in buy plan :", userInfo)
                return next(CustomErrorHandler.whentWrong())
            }
            if (userInfo.balance < planInvestment) {
                return next(CustomErrorHandler.insufficientBalance('insufficient wallet balance please recharge your wallet !'))
            }
            // update user balance and push plan in plans
            const updateUserBalanceAndPlans = await userModel.updateMany({ _id: req.body.user }, {
                $set: { balance: userInfo.balance - planInvestment },
                $push: {
                    plan: {
                        user_id: userInfo._id,
                        username: userInfo.username,
                        plan_id: plan._id,
                        plan_name: plan.plan_name,
                        status: plan.status,
                        investment_amount: plan.investment_amount,
                        daily_earning: plan.daily_earning,
                        img: plan.img,
                        roi: parseFloat(plan.roi),
                        duration: parseFloat(plan.duration),
                        remaining_days: parseFloat(plan.duration),
                        activation_date: moment().locale('en-in').format('lll'),
                        expiry_date: moment().locale('en-in').add(plan.duration, 'days').format('lll')
                    }
                }
            })


            // console.log("result of updateUserBalanceAndPlans ", updateUserBalanceAndPlans)
            if (updateUserBalanceAndPlans.modifiedCount === 1) {
                // add plan in buyedplan
                const addPlanInBuyedPlanTable = buyedplanModel({
                    user_id: userInfo._id,
                    username: userInfo.username,
                    plan_id: plan._id,
                    status: plan.status,
                    plan_name: plan.plan_name,
                    investment_amount: parseFloat(plan.investment_amount),
                    daily_earning: parseFloat(plan.daily_earning),
                    roi: parseFloat(plan.roi),
                    img: plan.img,
                    duration: parseFloat(plan.duration),
                    remaining_days: parseFloat(plan.duration),
                    activation_date: moment().locale('en-in').format('lll'),
                    expiry_date: moment().locale('en-in').add(plan.duration, 'days').format('lll')

                })
                const buyedPlanResult = await addPlanInBuyedPlanTable.save()
                // console.log("result at buyed plan table :", buyedPlanResult)
                if (!buyedPlanResult.id) {
                    console.log("error at buyedPlanResult.id Line No => 166")
                    return next(CustomErrorHandler.whentWrong('something went wrong at server side , please contact support !'))
                }

            }

            // print the result of update balance and push plan QUERY ...
            // console.log("result of updateUserBalanceAndPlans :", updateUserBalanceAndPlans)
            if (!updateUserBalanceAndPlans) {
                console.log("error at :updateUserBalanceAndPlans line => 175")
                return next(CustomErrorHandler.whentWrong())
            }
            res.json({ 'type': 'success', 'message': `${plan.plan_name} is purchesed successfully !` })
        } catch (error) {
            console.log('Error in catch at BUY PLAN :', error)
            return next(CustomErrorHandler.whentWrong())
        }


    }
}
export default plansController;