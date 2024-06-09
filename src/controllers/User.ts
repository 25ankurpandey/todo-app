import { Request, Response } from "express";
import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { controller, httpPatch, httpPost, httpPut } from "inversify-express-utils";
import { Constants } from "../constants/Constants";
import { BaseController } from "./Base";
import { ErrUtils } from "../utils/ErrUtils";
import { UserService } from "../services/UserService";
import { CreateUserValidationSchema, UpdateUserValidationSchema, UserLoginValidationSchema } from "../validators/validationSchemas";
import { ReqContextManager } from "../utils/context/ReqContextManager";
@controller(`${Constants.Context_Path}/user`)

export class UserController extends BaseController {
    constructor(
        @inject(UserService)
        private userService: UserService) {
        super();
    }

    @httpPut("/create")
    public async createUser(req: Request, res: Response): Promise<void> {
        try {
            const value = await CreateUserValidationSchema.validateAsync(req.body);
            const createUserRes = await this.userService.createUser(value);
            res.send(createUserRes);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "CREATE_USER_ERROR");
                throw err;
            }

        }
    }

    @httpPatch("/update")
    public async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const value = await UpdateUserValidationSchema.validateAsync(req.body);
            const createUserRes = await this.userService.updateUser(value);
            res.send(createUserRes);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "UPDATE_USER_ERROR");
                throw err;
            }

        }
    }

    @httpPost("/login")
    public async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const value = await UserLoginValidationSchema.validateAsync(req.body);
            const response = await this.userService.userLogin(value);
            res.send(response);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "USER_LOGIN_ERROR");
                throw err;
            }

        }
    }

    @httpPatch("/logout")
    public async logoutUser(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.userLogout(ReqContextManager.getToken());
            res.send(response);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "USER_LOGOUT_ERROR");
                throw err;
            }

        }
    }
}
