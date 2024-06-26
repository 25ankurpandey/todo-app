import { Op, where } from "sequelize";
import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { TasksInput, TasksOutput } from "../models/Tasks";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ReqContextManager } from "../utils/context/ReqContextManager";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");
@provideSingleton(TaskDal)
export class TaskDal {

    async getTasks(options: { [s: string]: any }): Promise<any[]> {
        const whereStatement = {
            user_id: ReqContextManager.getUserMeta().id
        };

        //orderStatement object is used to sort(order) tasks by any supported field
        let orderStatement = [["created_at", options.filters.sort]];
        if (options.filters.sort_by) {
            orderStatement = [[options.filters.sort_by, options.filters.sort]];
        }
        delete options.filters.sort;
        delete options.filters.sort_by;

        const page = options.page;
        const filters = options.filters;

        if (filters.date) {
            const startDate = dayjs.tz(filters.date, "Asia/Kolkata").startOf("day").toDate();
            const endDate = dayjs.tz(filters.date, "Asia/Kolkata").endOf("day").toDate();
            filters.created_at = {
                [Op.between]: [startDate, endDate]
            };
            delete filters["date"];
        }
        Object.assign(whereStatement, filters);

        // Sequelize automatically handles sorting, uses `order` parameter fot sorting
        const query = {
            where: whereStatement,
            order: orderStatement,
            nest: true,
            raw: true
        }

        if (page.limit !== null && page.offset !== null) {
            query["limit"] = page.limit;
            query["offset"] = page.offset;
        }
        return sequelizeConn["models"]["Tasks"].findAndCountAll(query);
    }

    async getTasksforReminders(): Promise<any> {
        const now = dayjs.tz(new Date(), "Asia/Kolkata");
        const fiveMinutesLater = now.add(5, "minute");

        const taskList = await sequelizeConn["models"]["Tasks"].findAll({
            where: {
                due_date: {
                    [Op.not]: null,
                    [Op.gte]: now.toDate(),
                    [Op.lte]: fiveMinutesLater.toDate(),
                },
                reminder_sent: false
            },
            include: [{
                model: sequelizeConn["models"]["UserAttributes"],
                as: "user",
                attributes: {
                    exclude: ["password", "created_at", "updated_at"]
                },
                where: { reminder_enabled: true }
            }],
        });
        return taskList;
    }

    async create(payload: TasksInput): Promise<TasksOutput> {
        return await sequelizeConn["models"]["Tasks"].create(payload);
    }

    async update(payload: Partial<TasksInput>, query = {}): Promise<TasksOutput> {
        return await sequelizeConn["models"]["Tasks"].update(payload, query);
    }

    async delete(taskId: number): Promise<TasksOutput> {
        return await sequelizeConn["models"]["Tasks"].destroy({
            where: {
                id: taskId
            }
        });
    }

    async checkIfTaskExists(task_id: number): Promise<boolean> {
        const task = await sequelizeConn["models"]["Tasks"].findOne({
            where: {
                id: task_id
            }
        });

        return task ? true : false;
    }
}