import { Schema, model } from "mongoose";

const otpModel = model('otps', Schema({
    mobileNo: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: { type: Date, expires: '10m', default: Date.now }
}, { timestamps: true }))
export default otpModel;