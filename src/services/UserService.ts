import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { BaseService } from "./BaseService";
import { UserDal } from "../repositories";
import { provideSingleton } from "../ioc/ioc";
import { ErrUtils } from "../utils/ErrUtils";
import { UserInput } from "../models/UserAttributes";
import { hashPassword, validatePassword, generateToken } from "../utils/util";
import { AuthenticationMiddleware } from "../utils/middleware/AuthenticationMiddleware";

@provideSingleton(UserService)
export class UserService extends BaseService {

    constructor(
        @inject(UserDal)
        public userDal: UserDal

    ) {
        super();
    }

    async createUser(reqBody: UserInput): Promise<any> {
        try {
            Logger.info("User creation...");
            const finduser = await this.userDal.getUserByEmail(reqBody.email);
            if (!finduser) {
                const jwtToken = await generateToken(reqBody.email);
                const hashedPassword = await hashPassword(reqBody.password);
                reqBody.password = hashedPassword;
                const user = await this.userDal.create(reqBody);
                return { user: user, jwtToken: jwtToken };
            } else {
                throw new Error("user already exists");
            }
        }
        catch (err) {
            Logger.error(err, "", "CREATE_USER_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async userLogin(reqBody: UserInput): Promise<any> {
        try {
            Logger.info("User login...");
            const finduser = await this.userDal.getUserByEmail(reqBody.email);
            if (!finduser) {
                throw new Error("user not found");
            }

            await validatePassword(reqBody.password, finduser.password);
            const jwtToken = await generateToken(finduser.email);
            return { user: finduser, jwtToken: jwtToken };
        }
        catch (err) {
            Logger.error(err, "", "USER_LOGIN_ERROR");
            if (err.message === "user not found") {
                err.message = "Incorrect username or password";
            }
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async userLogout(token: string): Promise<any> {
        try {
            Logger.info("User logout...");
            AuthenticationMiddleware.removeFromWhitelist(token);
            return { success: true };
        }
        catch (err) {
            Logger.error(err, "", "USER_LOGOUT_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }
}