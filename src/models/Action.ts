import { DataTypes, Model, Optional } from "sequelize";
import { Priority, Status } from "../interfaces/Task";

interface ActionAttributes {
    id: number;
    action: string;
}

export type ActionInput = Optional<ActionAttributes, null>
export type ActionOutput = Required<ActionAttributes>

export const ActionClassFactory = function () {
    return class Action extends Model<ActionAttributes, ActionInput> implements ActionAttributes {
        public id!: number;
        public action!: string;
    }
}

export const ActionModel = {
    "id": {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    "action": {
        type: DataTypes.STRING,
        allowNull: false,
    }
};