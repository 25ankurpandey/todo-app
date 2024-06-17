import Joi = require("joi");
import { Priority, ReminderMethod, Status } from "../interfaces/Task";

export const CreateUserValidationSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    mobile: Joi.string().required(),
    reminder_enabled: Joi.boolean().default(false),
    reminder_time: Joi.number().default(5),
    reminder_method: Joi.string().valid(ReminderMethod.EMAIL, ReminderMethod.PUSH)
}).unknown(false)
    .options({ abortEarly: false });

export const UpdateUserValidationSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    password: Joi.string().min(8),
    mobile: Joi.string(),
    reminder_enabled: Joi.boolean(),
    reminder_time: Joi.number(),
    reminder_method: Joi.string().valid(ReminderMethod.EMAIL, ReminderMethod.PUSH)
}).unknown(false)
    .options({ abortEarly: false });

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
    description: Joi.string().allow(null, ""),
    due_date: Joi.date().allow(null),
    priority: Joi.string()
        .valid(...Object.values(Priority))
        .default(Priority.MEDIUM)
        .insensitive(),
    status: Joi.string()
        .valid(...Object.values(Status))
        .default(Status.PENDING)
        .insensitive(),
    reminder_sent: Joi.boolean().default(false)
}).options({ abortEarly: false });

export const UpdateTaskValidationSchema = Joi.object({
    title: Joi.string().trim().pattern(/\S/),
    description: Joi.string().allow(null, ""),
    due_date: Joi.date().allow(null),
    priority: Joi.string()
        .valid(...Object.values(Priority))
        .default(Priority.MEDIUM),
    status: Joi.string()
        .valid(...Object.values(Status))
        .default(Status.PENDING),
    reminder_sent: Joi.boolean()
}).unknown(true)
    .options({ abortEarly: false });


/* 
Below validation schema provides validation for both filters ans sort parameters 
and sorts records in Ascending by default based on a default field 
if user tries to sort without specifying a field to sort by 
*/
export const FiltersValidationSchema = Joi.object({
    page_no: Joi.number().integer().min(1).optional(),
    page_size: Joi.number().integer().min(1).optional(),
    created_at: Joi.date(),
    status: Joi.string()
        .valid(...Object.values(Status)),
    priority: Joi.string()
        .valid(...Object.values(Priority)),
    sort: Joi.string().valid("ASC", "DESC").default("ASC").insensitive(),
    sort_by: Joi.string().valid("created_at",
        "priority").optional()
}).unknown(true)
    .options({ abortEarly: false });

export const AuthorizationMiddlewareConfigValidationSchema = Joi.object({
    excluded_paths: Joi.array().default([]).optional(),
    resource_urls: Joi.object().required(),
    accepted_actions: Joi.array().required()
}).options({ abortEarly: false });