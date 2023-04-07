
import cron from 'node-cron'
import buyedplanModel from './model/buyedPlanModel.js'
import userModel from './model/userModel.js'
import moment from 'moment'
//schedule a job

const cronTask = async () => cron.schedule('55 23 * * 0-6', async () => {
    console.log("cron id called !", moment())
    try {

        // find out tha active plans of user 
        const result = await buyedplanModel.find({ status: 'active' })
        result.map((item) => {
            update(item)
            // console.log(item.)
            return 0
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        })
    } catch (error) {
        console.log(error)
    }

}


)
async function update(item) {
    try {
        let remainingdayas = parseFloat(item.remaining_days)
        let dailyearning = parseFloat(item.daily_earning)
        let userId = item.user_id // id of user 
        let buyedPlanId = item._id // the id of document
        let planName = item.plan_name
        if (remainingdayas === 1) {
            console.log("this id last day of your plan")
            let setExpired = await buyedplanModel.updateOne({ _id: buyedPlanId }, {
                $set: {
                    'remaining_days': 0,
                    'status': 'expired'
                }
            })
            console.log("result of setExpired : ", setExpired)
            if (setExpired.modifiedCount === 1) {
                const updateUserEarning = await userModel.updateOne({ _id: userId }, {
                    $inc: { earning_balance: +dailyearning },
                    $push: {
                        'earnings': {
                            my_earning: dailyearning,
                            discryption: planName,
                            time: moment().locale('en-in').format('lll'),

                        }
                    }
                })
                console.log("result of updateUserEarning at expiry", updateUserEarning)
            }

            return
        }
        const updateRemainingDays = await buyedplanModel.updateOne({ _id: buyedPlanId }, {
            $set: {
                remaining_days: parseFloat(remainingdayas - 1)
            }
        })
        console.log("result at updateRemainingDays :", updateRemainingDays)
        if (updateRemainingDays.modifiedCount === 1) {
            console.log("modified count 1 at update remaining balance")
            const updateUserEarning = await userModel.updateOne({ _id: userId }, {
                $inc: { earning_balance: +dailyearning },
                $push: {
                    'earnings': {
                        my_earning: dailyearning,
                        discryption: planName,
                        time: moment().locale('en-in').format('lll'),

                    }
                }
            })
            console.log("result of updateUserEarning at else ", updateUserEarning)
        }

    } catch (error) {
        console.log("error at update in cron job")
    }
}
export default cronTask
// const updateUsersEarning=