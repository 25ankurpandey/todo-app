import { where } from "sequelize";
import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { TasksInput, TasksOutput } from "../models/Tasks";
import { ReqContextManager } from "../utils/context/ReqContextManager";

@provideSingleton(TaskDal)
export class TaskDal {

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