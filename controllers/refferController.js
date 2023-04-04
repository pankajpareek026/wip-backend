import userModel from "../model/userModel"
import CustomErrorHandler from "../services/CustomErrorHandler"

const refferController={
   async getRefferCode(req,res,next)
   {
    console.log(req.body)
        try {
            const { user } = req.body
            const query = await userModel.findOne({ _id:user })
            console.log('reffer code :', query.refferal_code)
            if(!query.refferal_code)
            {
                return next(CustomErrorHandler.whentWrong())
            }
            res.json({ type: 'success', refferCode: query.refferal_code })

        } catch (error) {
            console.log(error)
            return next(CustomErrorHandler.whentWrong())
        }
   }
   ,
   async getRefferalData(req,res,next)
   {
const refferalData=await userModel.findOne({_id:req.body.user})
res.json({
    status:'success',
    data:refferalData.refferals
})
   }
}
export default refferController