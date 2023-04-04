import { number } from "joi";
import { Schema, model } from "mongoose";
const userSchema = new Schema(
    {
        balance: {
            type: Number,
            default: 0
        },

        locked_balance: {
            type: Number,
            default: 0
        },
        earning_balance: {
            type: Number,
            default: 0
        }, total_deposits: {
            type: Number,
            default: 0
        },
        total_withdrawls: {
            type: Number,
            default: 0
        },
        refferal_income: {
            type: Number,
            default: 0
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        mobileNo: {
            type: Number,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        deposit: {
            type: [],
        },
        withdraw: {
            type: []
        }
        , refferals: []
        , plan: [],
        earnings: [],
        refferal_code: {
            type: String,
            require: true,
            unique: true
        },
        withdraw_address: {
            type: String
        },
        invitee: {
            type: String,
        },
        user_status: {
            type: String,
            default: "active"
        }

    }, {
    timestamps: true
}
)
const userModel = model('users', userSchema)
export default userModel;



/**
 * specifications: The fields to
 *   include or exclude.
 
{
    'username': 1, 'balance': 1,
        'deposit': 1,
            'amt': {
        $filter: {
            input: "$deposit",
                as: "deposit",
                    cond: { $eq: ["$$deposit.status", 'success'] }

        }

    }





}*/