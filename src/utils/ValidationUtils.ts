/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrUtils } from "./ErrUtils";

export class ValidationUtils {

  public static validateStringNotEmpty(str: any, name: string) {
    if (str === null || typeof str === "undefined") {
      ErrUtils.throwValidationError(`${name} may not be null, undefined or blank`, { message: `${name} may not be null, undefined or blank` });
    }
    else if (typeof str !== "string") {
      ErrUtils.throwValidationError(`${name} is not a valid string type`, { message: `${name} is not a valid string type` });
    }
    else if (str.trim().length === 0) {
      ErrUtils.throwValidationError(`${name} may not be null, undefined or blank`, { message: `${name} may not be null, undefined or blank` });
    }
  }

  public static validateEmail(email: string, name = "email") {
    // eslint-disable-next-line no-useless-escape
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email === null || !re.test(email)) {
      ErrUtils.throwValidationError(`Invalid ${name} provided: ${email}`, "VALIDATION_ERR");
    }
  }

  public static validateDate(dateInput: string, inputName = "date") {
    const date = new Date(dateInput);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (date === "Invalid Date") {
      ErrUtils.throwValidationError(`Invalid Field ${inputName} with value Date: ${date}`, "VALIDATION_ERR");
    }
  }

  public static validateIsNotNullOrUndefined(param: any, name: string) {
    if (param === null || typeof param === "undefined") {
      ErrUtils.throwValidationError(`${name} may not be null or undefined`,
        "VALIDATION_ERR");
    }
  }

  public static validateIsBoolean(param: any, name: string) {
    ValidationUtils.validateIsNotNullOrUndefined(param, name);
    if (typeof param !== "boolean") {
      throw ErrUtils.throwValidationError(`${name} should be of type boolean`, "VALIDATION_ERR");
    }
  }

  public static validateIsArray(arr: any[], name: string) {
    ValidationUtils.validateIsNotNullOrUndefined(arr, name);

    if (!Array.isArray(arr)) {
      ErrUtils.throwValidationError(`${name} is not an array`, "NOT_ARRAY");
    }
  }

  public static validateArrayNotEmpty(arr: any[], name: string) {
    ValidationUtils.validateIsArray(arr, name);

    if (arr.length === 0) {
      ErrUtils.throwValidationError(`Array ${name} is empty`, "EMPTY_ARRAY");
    }
  }

  public static validateIsInteger(num: any, name: string): void {
    if (!Number.isInteger(num)) {
      ErrUtils.throwValidationError(`${name} must be an integer`, { message: `${name} NOT_AN_INTEGER`});
    }
  }

  public static validateIsNumber(num: any, name: string): void {
    if (isNaN(num)) {
      ErrUtils.throwValidationError(`${name} must be a number`, "NOT_A_NUMBER");
    }
  }

  public static validateIsPositiveInteger(num: any, name: string): void {
    ValidationUtils.validateIsInteger(num, name);

    if (num < 1) {
      ErrUtils.throwValidationError(`${name} must be a positive integer`, "NOT_A_POSITIVE_INTEGER");
    }
  }

  public static validateIsIntegerLessThanEq(num: any, name: string, maxVal: any): void {
    ValidationUtils.validateIsInteger(num, name);
    ValidationUtils.validateIsNumber(maxVal, "maxVal");

    if (num > maxVal) {
      ErrUtils.throwValidationError(`${name} must be an integer less than or equal to ${maxVal}`, "INTEGER_OUT_OR_RANGE");
    }
  }

  public static validateIsIntegerGreaterThanEq(num: any, name: string, minVal: any): void {
    ValidationUtils.validateIsInteger(num, name);
    ValidationUtils.validateIsNumber(minVal, "minValue");

    if (num < minVal) {
      ErrUtils.throwValidationError(`${name} must be a an integer greater than or equal to ${minVal}`, "INTEGER_OUT_OR_RANGE");
    }
  }

  public static validateIsIntegerWithinRange(num: any, name: string, minVal: any, maxVal: any): void {
    ValidationUtils.validateIsInteger(num, name);
    ValidationUtils.validateIsNumber(maxVal, "maxVal");
    ValidationUtils.validateIsNumber(minVal, "minVal");

    if (num < minVal || num > maxVal) {
      ErrUtils.throwValidationError(`${name} must be an integer less than ${minVal} and greater than ${maxVal}`, "NOT_A_POSITIVE_INTEGER");
    }
  }

  public static validateIsPositiveNumber(num: any, name: string): void {
    if (isNaN(num) || num <= 0) {
      ErrUtils.throwValidationError(`${name} must be a positive number`, "NOT_A_POSITIVE_NUMBER");
    }
  }

  public static validateIsNumberLessThanEq(num: any, name: string, maxVal: any): void {
    ValidationUtils.validateIsNumber(num, name);
    ValidationUtils.validateIsNumber(maxVal, "maxVal");

    if (num > maxVal) {
      ErrUtils.throwValidationError(`${name} must be an number less than or equal to ${maxVal}`, "INTEGER_OUT_OR_RANGE");
    }
  }

  public static isStringEmpty(str: string) {
    return str && str.trim().length > 0;
  }

}