// function to send deposit addreess to use on request
import Joi from "joi"
import depositAddressModel from "../model/depositAddressModel"

import CustomErrorHandler from "../services/CustomErrorHandler"

const depositAddressController = {
    async getAddress(req, res, next) {
        // console.log("deposit address conteoller hitted !")
        try {
            // console.log(req.headers)
            const getAddressSchema = Joi.object({
                chain: Joi.string().required(),
                coin: Joi.string().required()
            })
            const { erro } = getAddressSchema.validate(req.headers)
            if (erro) {
                return next(erro)
            }
            const addressData = await depositAddressModel.findOne({ chain: req.headers.chain, type: 'primary' })
            // console.log("Wallet address at controller :", addressData);
            res.json({
                 type: "success", address: addressData.address, asset: addressData.coin, chain: addressData.chain ,explorer:addressData.explorer
                })
        } catch (error) {
            next(CustomErrorHandler.whentWrong())
        }
    }
}

export default depositAddressController