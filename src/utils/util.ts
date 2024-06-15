import to from "await-to-js";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
import { Logger } from "./logging/Logger";
import { ValidationUtils } from "./ValidationUtils";
import { Constants } from "../constants/Constants";
import { AuthenticationMiddleware } from "./middleware/AuthenticationMiddleware";

export const tryCatchWrapper = async function (task): Promise<any[]> {
    const [err, res] = await to(task);
    if (err) Logger.error(err, "", "tcwrapper");
    return [err, res];
};

export function generateToken(data: any): string {
    const dataToSign = typeof data === "string" ? { data } : data;
    const token = jwt.sign(dataToSign, process.env.JWT_SECRET, { expiresIn: Constants.jwtExpiration });
    AuthenticationMiddleware.addToWhitelist(token);
    return token;
}

export async function hashPassword(password: string): Promise<string> {
    try {
        ValidationUtils.validateStringNotEmpty(process.env.SALT_ROUNDS, "SALT_ROUNDS");
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
        return hashedPassword;
    } catch (error) {
        Logger.error(error, "", "HASH_ERROR");
        throw new Error("error while hashing password");
    }
}

export async function validatePassword(userEnteredPassword: string, hashedPasswordFromDB: string): Promise<string> {
    try {
        const res = await bcrypt.compare(userEnteredPassword, hashedPasswordFromDB);
        if(res === false) throw new Error("wrong password");
        return res;
    } catch (error) {
        Logger.error(error, "", "BAD_PASSWORD");
        throw new Error("wrong password");
    }
}

export const getPagination = (page, size) => {
    const limit = size ? +size : 5;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };
  
  export const getFormattedPagingData = (result, pageSize, page) => {
    const { count: totalCount, rows: data } = result;
    const currentPage = page ? +page : 1;
    const finalPageSize = pageSize || 5;
  
  
    return {
      data: data,
      meta: {
        total_count: totalCount,
        page_size: finalPageSize,
        page_no: currentPage,
      }
    };
  };