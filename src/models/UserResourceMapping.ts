import { DataTypes, Model, Optional } from "sequelize";

interface UserResourceMappingAttributes {
    user_id: number;
    resource_id: number;
}

export type UserResourceMappingInput = Optional<UserResourceMappingAttributes, null>
export type UserResourceMappingOutput = Required<UserResourceMappingAttributes>

export const UserResourceMappingClassFactory = function () {
    return class UserResourceMapping extends Model<UserResourceMappingAttributes, UserResourceMappingInput> implements UserResourceMappingAttributes {
        public user_id!: number;
        public resource_id!: number;
        static associate(modelMap) {
            this.belongsTo(modelMap["Resource"]["class"],
                { foreignKey: "resource_id", targetKey: "id", as: "resource" });
            this.belongsTo(modelMap["UserAttributes"]["class"],
                { foreignKey: "user_id", targetKey: "id", as: "user" });
        }
    }
}

export const UserResourceMappingModel = {
    "user_id": {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    "resource_id": {
        type: DataTypes.INTEGER,
        primaryKey: true,
    }
};