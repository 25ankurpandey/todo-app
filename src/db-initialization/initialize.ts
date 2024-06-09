import { Dialect, Sequelize } from "sequelize";
import { DbConfig } from "../interfaces/Configs";
import { Logger } from "../utils/logging/Logger";
import { UserClassFactory, UserModel } from "../models/UserAttributes";
import { RequestAuditClassFactory, RequestAuditModel } from "../models/RequestAudit";
import { TasksClassFactory, TasksModel } from "../models/Tasks";

let sequelizeConn: { [propName: string]: any } = {};
const dialect: Dialect = "mysql";

async function createDBConn(dbConfig: DbConfig): Promise<void> {
		const modelMap = {
			UserAttributes: { class: UserClassFactory(), model: UserModel },
			RequestAudit: { class: RequestAuditClassFactory(), model: RequestAuditModel },
			Tasks: { class: TasksClassFactory(), model: TasksModel }
		};
		const models = Object.keys(modelMap);
		sequelizeConn = { "conn": null, "models": {} };
		const dbConfigDefault = dbConfig.default;
		const dbConfigReplica = dbConfig.replica;
		dbConfigDefault.dialect = dialect;
		dbConfigDefault.dialectOptions = {
			decimalNumbers: true,
			dateStrings: true,
			typeCast: true
		};
		dbConfigDefault.timezone = "+05:30"; // IST timezone offset
		dbConfigDefault.replication = {
			read: [{
				host: dbConfigDefault.host,
				username: dbConfigDefault.username,
				password: dbConfigDefault.password
			}],
			write: { host: dbConfigDefault.host, username: dbConfigDefault.username, password: dbConfigDefault.password }
		};
		sequelizeConn.conn = new Sequelize(dbConfigDefault.database, dbConfigDefault.username, dbConfigDefault.password, dbConfigDefault);
		const modelOptions = {
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			underscored: true,
			sequelize: sequelizeConn["conn"],
		};
		models.forEach((model) => {
			modelMap[model]["class"].init(modelMap[model]["model"], modelOptions);
			if (typeof modelMap[model]["class"].associate === "function") {
				modelMap[model]["class"].associate(modelMap);
			}
			sequelizeConn["models"][model] = modelMap[model]["class"];
		});
		sequelizeConn["conn"].sync({ force: false });
	}
	Logger.info("Mysql Connection Initialised");

export { sequelizeConn, createDBConn };