import { Schema, model } from 'mongoose'

const planSchema = Schema({
    plan_name: { type: String, require: true },
    duration: {
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
    }, img: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true,
        default: 'active'
    }
    ,
    daily_earning: {
        type: String,
        required: true,
    }

}, { timestamps: true })
const planModel = model('plans', planSchema)
export default planModel;
