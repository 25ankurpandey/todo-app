import { Op, where } from "sequelize";
import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { TasksInput, TasksOutput } from "../models/Tasks";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata"); 
@provideSingleton(TaskDal)
export class TaskDal {

    async getAll(user_id: number, query: any): Promise<any[]> {
        const whereStatement = {
            user_id: user_id
        };
        
        if (query.date) {
            const startDate = dayjs.tz(query.date, "Asia/Kolkata").startOf("day").toDate(); 
            const endDate = dayjs.tz(query.date, "Asia/Kolkata").endOf("day").toDate(); 
            query.created_at = {
                [Op.between]: [startDate, endDate]
            };
            delete query["date"];
        }
        Object.assign(whereStatement, query);

        return sequelizeConn["models"]["Tasks"].findAll({
            where: whereStatement,
            raw: true
        });
    }

    async create(payload: TasksInput): Promise<TasksOutput> {
        return await sequelizeConn["models"]["Tasks"].create(payload);
    }

    async update(payload: TasksInput): Promise<TasksOutput> {
        await sequelizeConn["models"]["Tasks"].update(payload, {
            where: {
                id: payload.id
            }
        }
        );

        const updatedTask = await sequelizeConn["models"]["Tasks"].findOne({
            where: {
                id: payload.id
            }
        });
        return updatedTask;
    }

    async delete(taskId: number): Promise<TasksOutput> {
        return await sequelizeConn["models"]["Tasks"].destroy({
            where: {
                id: taskId
            }
        });
    }

    async checkIfTaskExists(task_id: number): Promise<boolean> {
        const task =  await sequelizeConn["models"]["Tasks"].findOne({
            where: {
                id: task_id
            }
        });

        return task ? true : false;
    }
}