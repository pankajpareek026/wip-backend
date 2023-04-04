class CustomErrorHandler extends Error {
    constructor(status, message, type) {
        super();
        this.status = status;
        this.message = message;
        this.type = type;
    }

    static alreadyExists(message, type = "warning") {
        return new CustomErrorHandler(409, message, type);
    }
    static invalidOtp(message, type = "error") {
        return new CustomErrorHandler(401, message = "Wrong OTP", type);
    }

    static wrongCredentials(message = "Username or password is wrong !", type = "error") {
        return new CustomErrorHandler(401, message, type)
    }
    static unAuthorised(message, type = "error") {
        return new CustomErrorHandler(401, message, type)
    }
    static notFound(message = "404 Not Found ",type='error') {
        return new CustomErrorHandler(404, message, type)
    }
    static invalidMobile(message = "invalid Mobile Number", type = "error") {
        return new CustomErrorHandler(400, message, type)
    }
    static invalidInput(message, type = "error") {
        return new CustomErrorHandler(400, message, type);
    }
    static notExists(message, type = "error") {
        return new CustomErrorHandler(404, message, type);
    }
    static invalidInviteCode(message, type = "warning") {
        return new CustomErrorHandler(400, message, type)
    }
    static tokenExpired(message, type = "error") {
        return new CustomErrorHandler(400, message, type)
    }
    static whentWrong(message = "something whent wrong !", type = "error") {
        return new CustomErrorHandler(400, message, type)
    }
    static insufficientBalance(message = "insufficient wallet balance !", type = "error") {
        return new CustomErrorHandler(400, message, type)
    }

    static badRequest(message = "Bad Request !", type = "error") {
        return new CustomErrorHandler(400, message, type)
    }
}


export default CustomErrorHandler;