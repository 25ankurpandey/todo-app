import { DataTypes, Model, Optional } from "sequelize";
import { Priority, Status } from "../interfaces/Task";

interface TasksAttributes {
    id: number;
    title: string;
    description: string;
    due_date: Date;
    priority: Priority;
    status: Status;
    user_id: number;
}

export type TasksInput = Optional<TasksAttributes, null>
export type TasksOutput = Required<TasksAttributes>

export const TasksClassFactory = function () {
    return class Tasks extends Model<TasksAttributes, TasksInput> implements TasksAttributes {
        public id!: number;
        public title!: string;
        public description!: string;
        public due_date!: Date;
        public priority!: Priority;
        public status!: Status;
        public user_id!: number;
        static associate(modelMap) {
            this.belongsTo(modelMap["UserAttributes"]["class"],
                { foreignKey: "user_id", as: "user" });
        }
    }
}

export const TasksModel = {
    "id": {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    "title": {
        type: DataTypes.STRING,
        allowNull: false,
    },
    "description": {
        type: DataTypes.STRING,
    },
    "due_date": {
        type: DataTypes.DATE,
    },
    "priority": {
        type: DataTypes.ENUM(Priority.LOW, Priority.MEDIUM, Priority.HIGH),
        defaultValue: Priority.MEDIUM,
    },
    "status": {
        type: DataTypes.ENUM(Status.PENDING, Status.DONE),
        defaultValue: Status.PENDING,
    },
    "user_id": {
        type: DataTypes.INTEGER
    }
};