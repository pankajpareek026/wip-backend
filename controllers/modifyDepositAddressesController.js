// controller to creacrte delete and update deposit addresses
import Joi from "joi"
import depositAddressModel from "../model/depositAddressModel.js"

const modifyDepositAddressController ={
    async addNew(req,res,next)
    {
       try {
           const AddNewAddressSchema = Joi.object({
               address: Joi.string().required(),
               chain: Joi.string().required(),
               type: Joi.string().required(),
               coin: Joi.string().uppercase().length(4).required(),
               explorer: Joi.string().uri().required()
           })
           const { error } = AddNewAddressSchema.validate(req.body)
           if (error) {
               return next(error)
           }
           const query=await depositAddressModel(req.body)
           const queryResult= await query.save()
           console.log("query result in modifyController :",queryResult)
           res.json({
            messge:queryResult
           })
       } catch (error) {
        return next(error)
       }
    }
}
export default modifyDepositAddressController;