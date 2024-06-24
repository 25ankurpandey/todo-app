import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { BaseService } from "./BaseService";
import { TaskDal, UserDal } from "../repositories";
import { provideSingleton } from "../ioc/ioc";
import { ErrUtils } from "../utils/ErrUtils";
import { TasksInput } from "../models/Tasks";
import { ReqContextManager } from "../utils/context/ReqContextManager";
import { getPagination } from "../utils/util";
import { Priority, Status } from "../interfaces/Task";
import { Constants } from "../constants/Constants";
import { filter } from "lodash";

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

    /* 
    Below function fetches tasks for a user and also has sorting and filtering capabilities 
    */

    async fetchAndFilterAndSortTasks(filters: { [s: string]: any }): Promise<any> {
        try {
            Logger.info("Fetch task...");
            const options: { [s: string]: any } = {};
            let limit, offset;
            if (filters.page_no || filters.page_size) {
                ({ limit, offset } = getPagination(filters.page_no - 1, filters.page_size));
            }
            options.page = { limit, offset };
            delete filters.page_no;
            delete filters.page_size;
            options.filters = filters;
            const tasks = await this.taskDal.getTasks(options);
            return tasks;
        }
        catch (err) {
            Logger.error(err, "", "FETCH_TASK_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    // Function to fetch supported filters and sort by options
    async getTaskFiltersAndSortByOptions(): Promise<any> {
        try {
            Logger.info("Task filters and sort by options...");
            const statusFilters = Object.values(Status);
            const priorityFilters = Object.values(Priority);
            const filtersObj = {
                status_filter: statusFilters,
                priority_filter: priorityFilters
            };
            const sortingStrategies = Constants.Valid_Sorting_Strategies;
            const sortByOptions = Constants.Valid_Sort_By_Options;
            const sortObj = {
                sorting_strategy: sortingStrategies,
                sort_by: sortByOptions
            };
            return {filter: filtersObj, sort: sortObj};
        }
        catch (err) {
            Logger.error(err, "", "FETCH_FILTERS_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    async createTask(reqBody: TasksInput): Promise<any> {
        try {
            Logger.info("Task creation...");
            const userId = ReqContextManager.getUserMeta().id;
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
            const userId = ReqContextManager.getUserMeta().id;
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