import { model, Schema } from 'mongoose'
const withdrawSchema = Schema({
    user_id: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    chain: {
        type: String,
        required: true
    },
    coin: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    time: {
        type: String,
        required: true,
        default: new Date().toLocaleString()
    },
    withdraw_id: {
        type: String,
        required: true
    },
    transaction_id: {
        type: String,
        required: true
    },
    actual_amount:{
        type:Number,
        required:true
    }
}, { timestamp: true })
const withdrawModel = model('withdrawl', withdrawSchema);
export default withdrawModel;