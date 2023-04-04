import rateLimitor from 'express-rate-limit';
 export default   rateLimitor({
        windowMs: 10 * 60 * 1000, // 10 min  in milliseconds
        max: 100,
        message: 'Too Many request Please try after sometime !',
        standardHeaders: true,
        legacyHeaders: false,
    })

