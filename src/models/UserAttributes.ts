import { DataTypes, Model, Optional } from "sequelize";
import { ReminderMethod } from "../interfaces/Task";

interface UserAttributes {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile: string;
  is_superuser: number;
  reminder_enabled: number;
  reminder_time: number;
  reminder_method: ReminderMethod;
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
        public is_superuser!: number;
        public reminder_enabled!: number;
        public reminder_time!: number;
        public reminder_method!: ReminderMethod;

        toJSON() {
          const values = Object.assign({}, this.get());
          delete values.password;
          return values;
      }
      }
}

export const UserModel = {
  "id": {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  "first_name": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "last_name": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "email": {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  "password": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "mobile": {
    type: DataTypes.STRING,
    allowNull: false,
  },
  "is_superuser": {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  "reminder_enabled": {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  "reminder_time": {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  "reminder_method": {
    type: DataTypes.ENUM(ReminderMethod.PUSH, ReminderMethod.EMAIL)
  }
};