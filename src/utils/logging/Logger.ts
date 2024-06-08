/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from "path";
import * as winston from "winston";
import { ReqContextManager } from "../context/ReqContextManager";

export class Logger {
    private static logger: winston.Logger = null;
    private static initialized = false;
    private static nodeEnvLocal = false;

    public static init(service: string) {
        const nodeEnv: string = process.env.NODE_ENV;
        const MESSAGE = Symbol.for("message");
        const jsonFormatter = (logEntry) => {
            let json: any = {};
            const base = { timestamp: new Date() };
            json = Object.assign(base, logEntry);
            json.msg = json.message;
            delete json.message;
            logEntry[MESSAGE] = JSON.stringify(json);
            return logEntry;
        };
        if (!nodeEnv || nodeEnv === "local") {
            Logger.nodeEnvLocal = true;

            Logger.logger = winston.createLogger({
                level: "silly",
                format: winston.format(jsonFormatter)(),
                defaultMeta: { serviceName: service },
                transports: [
                    new winston.transports.Console()
                ]
            });
        } else {
            let transport: winston.transport = new winston.transports.Console();
            const is_transport_file = process.env.LOG_TRANSPORT_FILE || false;
            if (is_transport_file) {
                transport = new winston.transports.File({
                    filename: `${path.resolve(process.cwd())}/service.log`,
                    maxsize: 10485760 //10MB
                });
            }
            Logger.logger = winston.createLogger({
                level: process.env.LOG_LEVEL || "info",
                format: winston.format(jsonFormatter)(),
                defaultMeta: { serviceName: service },
                transports: [
                    transport
                ]
            });
        }
        Logger.initialized = true;
    }

    static log(level: string, message: string, data: { [s: string]: any },
        errorObj: { errMsg: string, errId: string, errType: string }) {

        if (!Logger.initialized) {
            throw new Error("The logger has not been initialized. Pleae init() it by calling Logger.init()");
        }

        const logData: winston.LogEntry = {
            level: level,
            message: message || "not_provided"
        };

        if (data && Object.keys(data).length > 0) {
            logData.data = data;
        } else {
            logData.data = "not_provided";
        }

        logData.epoch = new Date().getTime();
        logData.timestamp = new Date().toString();
        logData.env = process.env.ENVIRONMENT || "local";

        try {
            logData.traceAttributes = ReqContextManager.getTraceAttributes();

            const reqUrl: string = ReqContextManager.getReqUrl();

            if (reqUrl) {
                logData.reqUrl = reqUrl;
            }

            logData.ipAddress = ReqContextManager.getIpAddress();
            logData.caller = ReqContextManager.getCaller();

        } catch (err) {
            if (!(err.errId === "REQ_CONTXT_MGR_HEADERS_NOT_POPULATED" ||
                err.errId === "CONTEXT_MGR_NOT_INITIALIZED")) {
                throw err;
            }
        }

        if (level === "error") {
            logData.errorId = errorObj.errId;
            logData.errMsg = errorObj.errMsg;
            logData.errType = errorObj.errType;
        } else {
            logData.errorId = "not_applicable";
            logData.errMsg = "not_applicable";
            logData.errType = "not_applicable";
        }

        Logger.logger.log(logData);

    }
    public static silly(message: string, data: { [s: string]: any } = {}) {
        Logger.log("silly", message, data, null);
    }


    public static debug(message: string, data: { [s: string]: any } = {}) {
        Logger.log("debug", message, data, null);
    }

    public static info(message: string, data: { [s: string]: any } = {}) {
        Logger.log("info", message, data, null);
    }

    public static warn(message: string, data: { [s: string]: any } = {}) {
        Logger.log("warn", message, data, null);
    }

    public static error(err: Error, errId: string,
        errType: string, data: { [s: string]: any } = {}) {
        const errMsg = err.message as string;
        Logger.log("error", `${err.stack}`, data, {
            errMsg,
            errId,
            errType
        });
    }
}