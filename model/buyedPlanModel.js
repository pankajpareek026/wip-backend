import { Schema, model } from 'mongoose'
const buyedPlanSchema = Schema({

    // user_id: userInfo._id,
    // username: userInfo.username,
    // plan_id: plan._id,
    // status: plan.status,
    // plan_name:plan.name
    // investment_amount: plan.investment_amount,
    // daily_earning: plan.daily_earning,
    // roi: parseFloat(plan.roi),
    // duration: parseFloat(plan.duration),
    // remaining_days: parseFloat(plan.duration),
    // activation_date: moment().locale('en-in').format('ll'),
    // expiry_date: moment().locale('en-in').add(plan.duration, 'days').format('lll')

    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    plan_name: {
        type: String,
        required: true
    },
    investment_amount: {
        type: Number,
        required: true
    },
    roi: {
        type: Number,
        required: true
    },
    activation_date: {
        type: String,
        required: true
    },
    expiry_date: {
        type: String,
        required: true
    },
    daily_earning: {
        type: Number,
        required: true
    },
    remaining_days: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true
    }
})
const buyedplanModel = model('buyedPlans', buyedPlanSchema)
export default buyedplanModel;