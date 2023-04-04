// this a model to mantain deposit address
import { Schema, model } from "mongoose";
const depositAddressSchema = Schema({
    address: {
        type: String,
        unique: true,
        require: true
    },
    chain: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true,
        default: 'secondary'
    },
    coin: {
        type: String,
        require: true
    },
    explorer: {
        type: String,
        require: true
    },
    AddedAt: {
        type: Date,
        default: Date.now()
    }

})
const depositAddressModel = model('deposit-address', depositAddressSchema);
export default depositAddressModel;