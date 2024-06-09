import express from "express";
import { ReqContextManager } from "../context/ReqContextManager";
import { ContextManager } from "../context/ContextManager";
import { Logger } from "../logging/Logger";
const jwt = require("jsonwebtoken");
import { ErrUtils } from "../ErrUtils";
import { UserDal } from "../../repositories/UserDal";

let tokenWhitelist: string[] = [];

export class AuthenticationMiddleware {
    public static addToWhitelist(token: string): void {
        if (tokenWhitelist.includes(token)) {
            return;
        }
        tokenWhitelist.push(token);
        Logger.debug("Token added to whitelist:", { token: token });
    }

    public static removeFromWhitelist(token: string): void {
        tokenWhitelist = tokenWhitelist.filter(item => item !== token.split(" ")[1]);
        Logger.debug("Token removed from whitelist:", { token: token });
    }

    public static async checkAuthentication(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!ReqContextManager.getAuthenticationRequired()) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            ErrUtils.throwNotFoundError("NOT_FOUND_ERR", { message: "Authorization header is missing" });
        } else {
            if (!authHeader.startsWith("Bearer ")) {
                ErrUtils.throwSystemError("TOKEN_ERROR", { message: "Authorization header is invalid" });
            }

            // Extract JWT token
            const token = authHeader.split(" ")[1];
            if (!token) {
                ErrUtils.throwSystemError("TOKEN_ERROR", { message: "JWT token is missing" });
            }

            // Check if token is in the whitelist
            if (!tokenWhitelist.includes(token)) {
                ErrUtils.throwSystemError("AUTHENTICATION_ERROR", { message: "JWT token is not whitelisted" });
            }

            // Verify JWT token
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        ErrUtils.throwSystemError("AUTHENTICATION_ERROR", { message: "JWT token has expired" });
                    } else {
                        Logger.error(err, "", "JWT verification error");
                        ErrUtils.throwSystemError("AUTHENTICATION_ERROR", { message: "JWT verification error" });
                    }
                }
                const userId = await new UserDal().getUserId(decoded.data)
                ContextManager.setAttribute(ReqContextManager.X_USER, decoded.data)
                ContextManager.setAttribute(ReqContextManager.USER_META, { user_id: userId, email: decoded.data })
                next();
            });
        }
    }
}
