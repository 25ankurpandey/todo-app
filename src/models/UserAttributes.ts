import { DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: string;
}

export type UserInput = Optional<UserAttributes, null>
export type UserOutput = Required<UserAttributes>

export const UserClassFactory = function () {
    return class User extends Model<UserAttributes, UserInput> implements UserAttributes {
        public id!: number;
        public first_name!: string;
        public last_name!: string;
        public email!: string;
        public password!: string;
        public mobile!: string;
      }
}

export const UserModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};