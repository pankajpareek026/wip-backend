// this service will be used for generate ,send and veriyfy the OTP for Register route;
import errorHandler from "../middlewares/errorHandler";
import otpModel from "../model/otpModel"

class otpService {
    // generate New OTP
    static async sendOTP(mobileNo, otp) {

        try {
            const exist = await otpModel.exists({ mobileNo })
            if (exist) {
                const deleteResult = await otpModel.deleteOne({ mobileNo })
                console.log(deleteResult)
                const OTP = await new otpModel({ mobileNo, otp })
                const result = await OTP.save()
                console.log(result)
                console.log("data inside servicce :", mobileNo, otp)
                return result;
            }

            const OTP = await new otpModel({ mobileNo, otp })
            const result = await OTP.save()
            console.log(result)
            console.log("data inside servicce :", mobileNo, otp)
            return result;

        } catch (error) {
            return error;

        }
    }
    // verify OTP
    static async verifyOTP(mobileNo, otp) {
        console.log("at verify function !")
        try {
            console.log(mobileNo, otp)
            const result = await otpModel.findOne({ mobileNo }) // to find is mobile number exists
            console.log("result in service :",result)
            if (result) {
                const validOtp = result.otp == otp
                // return validOtp;
                console.log("at servece :", result)
                console.log("Vallid OTP:", validOtp)
                console.log("valid otp:", validOtp)
                if (!validOtp) {
                    return { "type": "error", "message": " Invalid OTP !" }
                }

                else {
                    return { "type": "success", "message": " Mobile number verified successfully !" }
                }

            }
            else {
                return { "type": "error", "message": " Expired OTP, Please request again for OTP !" }

            }
            // return result;
        } catch (error) {
            return { "type": "error", "message": error }

        }
    }
    
}
export default otpService;