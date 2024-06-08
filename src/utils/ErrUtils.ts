require("express-async-errors");
import { ReqContextManager } from "./context/ReqContextManager";

export class ErrUtils {
  private static ERROR_MAP = {
    CLIENT_ERRORS: {
      VALIDATION_ERR: {
        ERR_CODE: 1,
        HTTP_CODE: "400",
        ERR_TYPE: "VALIDATION_ERR",
      },
      NOT_FOUND_ERR: {
        ERR_CODE: 2,
        HTTP_CODE: "404",
        ERR_TYPE: "NOT_FOUND_ERR",
      },
    },
    SERVER_ERRORS: {
      SYSTEM_ERR: {
        ERR_CODE: 3,
        HTTP_CODE: "500",
        ERR_TYPE: "SYSTEM_ERR",
      },
      PERMISSION_ERR: {
        ERR_CODE: 4,
        HTTP_CODE: "401",
        ERR_TYPE: "PERMISSION_ERR",
      },
      DATABASE_ERR: {
        ERR_CODE: 5,
        HTTP_CODE: "500",
        ERR_TYPE: "DATABASE_ERR",
      }
    }
  };



  public static createError(errMsg: string, code: number, type: string, details: any, status: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error: any = new Error(errMsg);
    error.code = code;
    error.type = type;
    error.traceId = ReqContextManager.getRequestId();
    error.details = details;
    error.status = status;
    return error;
  }

  public static createValidationError(errMsg: string, details: any) {
    const VALIDATION_ERR = ErrUtils.ERROR_MAP.CLIENT_ERRORS.VALIDATION_ERR;
    return ErrUtils.createError(errMsg, VALIDATION_ERR.ERR_CODE, VALIDATION_ERR.ERR_TYPE, details, VALIDATION_ERR.HTTP_CODE);
  }

  public static throwValidationError(errMsg: string, details: any) {
    throw ErrUtils.createValidationError(errMsg, details);
  }

  public static createNotFoundError(errMsg: string, details: any) {
    const NOT_FOUND_ERR = ErrUtils.ERROR_MAP.CLIENT_ERRORS.NOT_FOUND_ERR;
    return ErrUtils.createError(errMsg, NOT_FOUND_ERR.ERR_CODE, NOT_FOUND_ERR.ERR_TYPE, details, NOT_FOUND_ERR.HTTP_CODE);
  }

  public static throwNotFoundError(errMsg: string, details: any) {
    throw ErrUtils.createNotFoundError(errMsg, details);
  }

  public static createSystemError(errMsg: string, details: any) {
    const SYSTEM_ERR = ErrUtils.ERROR_MAP.SERVER_ERRORS.SYSTEM_ERR;
    return ErrUtils.createError(errMsg, SYSTEM_ERR.ERR_CODE, SYSTEM_ERR.ERR_TYPE, details, SYSTEM_ERR.HTTP_CODE);
  }

  public static throwSystemError(errMsg: string, details: any) {
    throw ErrUtils.createSystemError(errMsg, details);
  }

  public static createPermissionError(errMsg: string, details: any) {
    const PERMISSION_ERR = ErrUtils.ERROR_MAP.SERVER_ERRORS.PERMISSION_ERR;
    return ErrUtils.createError(errMsg, PERMISSION_ERR.ERR_CODE, PERMISSION_ERR.ERR_TYPE, details, PERMISSION_ERR.HTTP_CODE);
  }

  public static throwPermissionError(errMsg: string, details: any) {
    throw ErrUtils.createPermissionError(errMsg, details);
  }

  public static createDatabaseError(errMsg: string, details: any) {
    const DATABASE_ERR = ErrUtils.ERROR_MAP.SERVER_ERRORS.DATABASE_ERR;
    return ErrUtils.createError(errMsg, DATABASE_ERR.ERR_CODE, DATABASE_ERR.ERR_TYPE, details, DATABASE_ERR.HTTP_CODE);
  }

  public static throwDatabaseError(errMsg: string, details: any) {
    throw ErrUtils.createDatabaseError(errMsg, details);
  }
}