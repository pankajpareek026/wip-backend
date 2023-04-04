import random from 'random-ext'
const refferalService={
    async generateCode(req,res,next)
    {
      const code= random.restrictedString(
            [random.CHAR_TYPE.LOWERCASE],
            5,
            5
        )
        // return code;
        req.body.refferal_code=code;
        next()
    },
    async generateDepositID(req,res,next)
    {
        const code = random.restrictedString(
            [random.CHAR_TYPE.NUMERIC],
            15,
            15
        )
        // return code;
        req.body.deposit_id = code;
        next()
    },
async generateWithdrawID(req, res, next) {
        const code = random.restrictedString(
            [random.CHAR_TYPE.NUMERIC],
            15,
            15
        )
        // return code;
        req.body.withdraw_id = code;
        next()
    }
   
}
export default refferalService;