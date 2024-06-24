import { Request, Response } from "express";
import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { controller, httpDelete, httpGet, httpPatch, httpPost, httpPut } from "inversify-express-utils";
import { Constants } from "../constants/Constants";
import { BaseController } from "./Base";
import { ErrUtils } from "../utils/ErrUtils";
import { TaskService } from "../services/TaskService";
import { CreateTaskValidationSchema, UpdateTaskValidationSchema, FilterAndSortBysValidationSchema } from "../validators/validationSchemas";
import { getFormattedPagingData } from "../utils/util";
import { Priority, Status } from "../interfaces/Task";

@controller(`${Constants.Context_Path}/task`)

export class TaskController extends BaseController {
    constructor(
        @inject(TaskService)
        private taskService: TaskService) {
        super();
    }

    //Get tasks for a user. Supports filtering and sorting of tasks
    @httpGet("/")
    public async getTaskWithFilterAndSorting(req: Request, res: Response): Promise<void> {
        try {
            const query = await FilterAndSortBysValidationSchema.validateAsync(req.query);
            const page_no = query.page_no ? query.page_no : null;
            const page_size = query.page_size ? query.page_size : null;
            const tasks = await this.taskService.fetchAndFilterAndSortTasks(query);
            let response;

            if (page_no || page_size) {
                response = getFormattedPagingData(tasks, page_size, page_no);
            }
            else {
                const { count: totalCount, rows: data } = tasks;
                const currentPage = page_no;
                const finalPageSize = page_size;
                response = {
                    data: data,
                    meta: {
                        total_count: totalCount,
                        page_size: finalPageSize,
                        page_no: currentPage,
                    }
                };
            }
            res.send(response);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "CREATE_TASK_ERROR");
                throw err;
            }
        }
    }

    // Get supported filters and their values
    @httpGet("/filters")
    public async getTaskFiltersAndSortByOptions(req: Request, res: Response): Promise<void> {
        try {
            const responseObj = await this.taskService.getTaskFiltersAndSortByOptions();
            res.send(responseObj);
        } catch (err) {
            if (err.name === "ValidationError") {
                ErrUtils.throwValidationError("Validation error", err.details);
            } else {
                Logger.error(err, "400", "GET_FILTERS_ERROR");
                throw err;
            }
        }
    }

    //Create a task
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

    //Update an existing task 
    @httpPatch("/update/:id")
    public async updateTask(req: Request, res: Response): Promise<void> {
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

    //Delete an existing task
    @httpDelete("/delete/:id")
    public async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const task_id = parseInt(req.params.id);
            const response = await this.taskService.deleteTask(task_id);
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
