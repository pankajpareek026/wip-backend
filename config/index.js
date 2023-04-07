import dotenv from 'dotenv'
dotenv.config()
export const {
DB_URL,APP_PORT,DEBUG_MODE,JWT_SECRET,bep20_usdt,bep20_busd,trc20_usdt
} = process.env
