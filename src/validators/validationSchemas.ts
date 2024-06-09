import Joi = require("joi");
import { Priority, Status } from "../interfaces/Task";

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
    url: Joi.string().required(),
    excluded_paths: Joi.array().default([]).optional(),
    resource_urls: Joi.object().required(),
}).options({ abortEarly: false });

export const CreateTaskValidationSchema = Joi.object({
    title: Joi.string().trim().pattern(/\S/).required(),
    description: Joi.string().allow(null, ''),
    due_date: Joi.date().allow(null),
    priority: Joi.string()
        .valid(...Object.values(Priority))
        .default(Priority.MEDIUM)
        .insensitive(),
    status: Joi.string()
        .valid(...Object.values(Status))
        .default(Status.PENDING)
        .insensitive(),
}).options({ abortEarly: false });

export const UpdateTaskValidationSchema = Joi.object({
    title: Joi.string().trim().pattern(/\S/),
    description: Joi.string().allow(null, ''),
    due_date: Joi.date().allow(null),
    priority: Joi.string()
        .valid(...Object.values(Priority))
        .default(Priority.MEDIUM),
    status: Joi.string()
        .valid(...Object.values(Status))
        .default(Status.PENDING),
}).unknown(true)
    .options({ abortEarly: false });

export const FiltersValidationSchema = Joi.object({
    created_at: Joi.date(),
    status: Joi.string()
        .valid(...Object.values(Status)),
    priority: Joi.string()
        .valid(...Object.values(Priority))
}).unknown(true)
    .options({ abortEarly: false });