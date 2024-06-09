import Joi = require("joi");
import { hashPassword } from "../utils/util";

export const CreateUserValidationSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    mobile: Joi.string().required()
}).options({ abortEarly: false });

export const UpdateUserValidationSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    password: Joi.string().min(8),
    mobile: Joi.string()
}).options({ abortEarly: false });

export const UserLoginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
}).options({ abortEarly: false });

export const AuthenticationMiddlewareConfigValidationSchema = Joi.object({
    url:Joi.string().required(),
    excluded_paths:Joi.array().default([]).optional(),
    resource_urls:Joi.object().required(),
}).options({ abortEarly: false });