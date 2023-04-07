import multer from "multer";
import authController from "../controllers/userAuthController.js";
import { rateLimitor, auth } from '../middlewares/index.js'
import refferalService from '../services/refferalService.js'
import { registerController, otpController, plansController, loginController, depositController, depositAddressController, modifyDepositAddressController, refferController, withdrawController, transactionsController, userController, adminControllers, dashBoardController } from '../controllers/index.js'
import express from 'express';
const router = express.Router();

const Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req.file)
        cb(null, './uploads', function (error, success) {
            if (error) console.log(error)
            console.log(success)
        })
    },
    filename: function (req, file, cb) {
        console.log(req.file)
        const name = Date.now() + "_" + file.originalname;
        cb(null, name,
            function (error) {
                if (error) console.log(error)
            });
    }
})
const upload = multer({ storage: Storage })
// client routes ......base api/
router.post('/register', rateLimitor, refferalService.generateCode, registerController.register)
router.post('/requestOtp/', rateLimitor, otpController.sendOtp)//to send otp
router.post('/login', loginController.login)
router.get('/logout', auth, loginController.logout)
router.get('/getAddress', auth, depositAddressController.getAddress);
router.get('/refferal', auth, refferController.getRefferCode);
router.get('/getPlan', auth, plansController.getPlans);
router.post('/purcheseplan', auth, plansController.buyPlan);
router.get('/getdashboard', auth, dashBoardController.getUserDashboardData);// to sed all data of use at dashboard page !
router.get('/getbalance', auth, dashBoardController.getBalance);// to sed all data of use at dashboard page !
router.get('/getActivePlans', auth, dashBoardController.getActiveplans);// to sed all data of use at dashboard page !
router.get('/userInfo', auth, userController.getUserInfo);
router.get('/refferalInfo', auth, refferController.getRefferalData);
router.post('/verifyOtp/', otpController.verifyOtp)//to send otp
router.get('/userAuth', authController)//to send otp
// router.post('/Deposit',refferalService.generateDepositID, auth, upload.single('screenshot'), depositController.deposit)//to send otp
router.post('/Deposit', auth, upload.single('screenshot'), refferalService.generateDepositID, depositController.deposit)//to send otp
router.post('/withdraw', auth, refferalService.generateWithdrawID, withdrawController.submitWithdrawlRequest)//to accept withdraw request
router.post('/depositIndTrns', auth, depositController.depositTransactionStatus)//to accept withdraw request
router.post('/withdrawIndTrns', auth, withdrawController.withdrawTransactionStatus)//to accept withdraw request
router.get('/getwithdrawls', auth, transactionsController.getWithdrawls)//to accept withdraw request

// router.post('/Deposit',depositController.deposit)//to send otp




// admin toutes... base /api/v9/secure/user/admin/address/requred/must/code/revenue/
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/add_deposit_address', modifyDepositAddressController.addNew)
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/add_plan', plansController.addPlan)  // to add plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/update_plan', plansController.updatePlan)  // to update plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/delete_plan', plansController.deletePlan)  // to delete  plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/pending_deposits', adminControllers.adminGetPendingDeposits)  // to delete  plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/pending_withdrawals', adminControllers.adminGetPendingWithdrawls)  // to delete  plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/process_deposit', adminControllers.processDepositTransaction)  // to delete  plan 
router.post('/v9/secure/user/admin/address/requred/must/code/revenue/process_withdraw', adminControllers.processWithdrawTransaction)  // to delete  plan 



// router.post('/v9/secure/user/admin/address/requred/must/code/revenue/update_deposit_address')
// router.post('/v9/secure/user/admin/address/requred/must/code/revenue/set_deposit_address')


export default router;