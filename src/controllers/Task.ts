import { Request, Response } from "express";
import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { controller, httpDelete, httpGet, httpPatch, httpPost, httpPut } from "inversify-express-utils";
import { Constants } from "../constants/Constants";
import { BaseController } from "./Base";
import { ErrUtils } from "../utils/ErrUtils";
import { TaskService } from "../services/TaskService";
import { CreateTaskValidationSchema, UpdateTaskValidationSchema, FiltersValidationSchema } from "../validators/validationSchemas";

@controller(`${Constants.Context_Path}/task`)

export class TaskController extends BaseController {
    constructor(
        @inject(TaskService)
        private taskService: TaskService) {
        super();
    }

    @httpGet("/")
    public async getTask(req: Request, res: Response): Promise<void> {
        try {
            const query = await FiltersValidationSchema.validateAsync(req.query);
            const tasks = await this.taskService.fetchTask(query);
            res.send(tasks);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "CREATE_TASK_ERROR");
                throw err;
            }

        }
    }

    @httpPut("/create")
    public async createTask(req: Request, res: Response): Promise<void> {
        try {
            const value = await CreateTaskValidationSchema.validateAsync(req.body);
            const createTaskRes = await this.taskService.createTask(value);
            res.send(createTaskRes);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "CREATE_TASK_ERROR");
                throw err;
            }

        }
    }

    @httpPatch("/update/:id")
    public async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const task_id = parseInt(req.params.id);
            req.body["id"] = task_id;
            const value = await UpdateTaskValidationSchema.validateAsync(req.body);
            const updateTaskRes = await this.taskService.updateTask(value);
            res.send(updateTaskRes);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "UPDATE_TASK_ERROR");
                throw err;
            }

        }
    }

    @httpDelete("/delete/:id")
    public async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const task_id = parseInt(req.params.id);
            const response= await this.taskService.deleteTask(task_id);
            res.send(response);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "DELETE_TASK_ERROR");
                throw err;
            }

        }
    }
}
