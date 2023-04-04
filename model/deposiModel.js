import { Schema, model } from "mongoose";
const depositSchema = Schema({
    user_id: {
        type: String,
        require: true
    }
    , amount: {
        type: Number,
        required: true
    },
    coin: {
        type: String,
        required: true
    },
    chain: {
        type: String,
        required: true
    },
    transaction_id: {
        type: String,
        required: true
    },
    screenshot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    },
    deposit_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    destination_address: {
        type: String,
        required: true
    },
    explorer: {
        type: String,
        required: true
    }, actual_amount:
    {
        type: Number,
        required: true
    }, fees: {
        type: Number,
        required: true
    }
}, { timestamps: true })
const depositModel = model("deposit", depositSchema)
export default depositModel;