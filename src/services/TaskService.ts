import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { BaseService } from "./BaseService";
import { TaskDal, UserDal } from "../repositories";
import { provideSingleton } from "../ioc/ioc";
import { ErrUtils } from "../utils/ErrUtils";
import { TasksInput } from "../models/Tasks";
import { hashPassword, validatePassword, generateToken } from "../utils/util";
import { AuthenticationMiddleware } from "../utils/middleware/AuthenticationMiddleware";
import { ReqContextManager } from "../utils/context/ReqContextManager";
import { Priority, Status } from "../interfaces/Task";

@provideSingleton(TaskService)
export class TaskService extends BaseService {

    constructor(
        @inject(TaskDal)
        public taskDal: TaskDal,
        @inject(UserDal)
        public userDal: UserDal
    ) {
        super();
    }

    async fetchTask(query: any): Promise<any> {
        try {
            Logger.info("Fetch task...");
            const userId = ReqContextManager.getUserMeta().user_id;
            const tasks = await this.taskDal.getAll(userId, query);
            const statusFilters = Object.values(Status);
            const priorityFilters = Object.values(Priority);
            return { tasks: tasks, status_filter: statusFilters, priority_filter: priorityFilters };
        }
        catch (err) {
            Logger.error(err, "", "FETCH_TASK_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async createTask(reqBody: TasksInput): Promise<any> {
        try {
            Logger.info("Task creation...");
            const userId = ReqContextManager.getUserMeta().user_id;
            reqBody["user_id"] = userId;
            return await this.taskDal.create(reqBody);
        }
        catch (err) {
            Logger.error(err, "", "CREATE_TASK_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async updateTask(reqBody: TasksInput): Promise<any> {
        try {
            Logger.info("Task update...");
            const userId = ReqContextManager.getUserMeta().user_id;
            reqBody["user_id"] = userId;
            if (await this.taskDal.checkIfTaskExists(reqBody.id)) {
                return await this.taskDal.update(reqBody);
            } else {
                throw new Error("Task doesn't exist");
            }
        }
        catch (err) {
            Logger.error(err, "", "UPDATE_USER_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async deleteTask(task_id: number): Promise<any> {
        try {
            Logger.info("Task delete...");
            if (await this.taskDal.checkIfTaskExists(task_id)) {
                const res = await this.taskDal.delete(task_id);
            } else {
                throw new Error("Task doesn't exist");
            }
            return { success: true };
        }
        catch (err) {
            Logger.error(err, "", "UPDATE_USER_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }
}