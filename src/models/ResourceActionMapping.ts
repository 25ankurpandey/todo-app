import { DataTypes, Model, Optional } from "sequelize";

interface ResourceActionMappingAttributes {
    resource_id: number;
    action_id: number;
}

export type ResourceActionMappingInput = Optional<ResourceActionMappingAttributes, null>
export type ResourceActionMappingOutput = Required<ResourceActionMappingAttributes>

export const ResourceActionMappingClassFactory = function () {
    return class ResourceActionMapping extends Model<ResourceActionMappingAttributes, ResourceActionMappingInput> implements ResourceActionMappingAttributes {
        public resource_id!: number;
        public action_id!: number;
        static associate(modelMap) {
            this.belongsTo(modelMap["Resource"]["class"],
                { foreignKey: "resource_id", targetKey: "id", as: "resource" });
            this.belongsTo(modelMap["Action"]["class"],
                { foreignKey: "action_id", targetKey: "id", as: "action" });
        }
    }
}

export const ResourceActionMappingModel = {
    "resource_id": {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    "action_id": {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
};