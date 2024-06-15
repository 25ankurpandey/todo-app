import { DataTypes, Model, Optional } from "sequelize";

interface ResourceAttributes {
    id: number;
    resource_name: string;
}

export type ResourceInput = Optional<ResourceAttributes, null>
export type ResourceOutput = Required<ResourceAttributes>

export const ResourceClassFactory = function () {
    return class Resource extends Model<ResourceAttributes, ResourceInput> implements ResourceAttributes {
        public id!: number;
        public resource_name!: string;
    }
}

export const ResourceModel = {
    "id": {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    "resource_name": {
        type: DataTypes.STRING,
        allowNull: false
    }
};