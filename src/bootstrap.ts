/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import * as express from "express";
import "reflect-metadata";
import { Request, Response } from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import { ContextManager } from "./utils/context/ContextManager";
import { ReqContextManager } from "./utils/context/ReqContextManager";
import { Logger } from "./utils/logging/Logger";
import { HttpClient } from "./utils/httpClient/HttpClient";
import { ReqResMiddleware } from "./utils/middleware/ReqResMiddleware";
import { AuthenticationMiddleware } from "./utils/middleware/AuthenticationMiddleware";
import { Constants } from "./constants/Constants";
import { ServiceConfig, DbConfig, CacheConfig } from "./interfaces/Configs";
import swaggerUI = require("swagger-ui-express");
import swaggerDoc = require("../apidoc.json");
import audit from "express-request-audit";;
import { container } from "./ioc/ioc";
import "./ioc/loader";
import { createDBConn, sequelizeConn } from "./db-initialization/initialize";
import { RequestAuditInput } from "./models/RequestAudit";
import { AerospikeAdapter } from "./utils/caching/AerospikeAdapter";

async function init() {
    const exposePort: boolean = process.env.EXPOSE_PORT === "false" ? false : true;

    initializeServer(exposePort);
    const serviceConfig = await getConfig();

    await connectToDB(serviceConfig.config_json.db_config);
    await connectToCache(serviceConfig.config_json.cache_config);
}

function initializeServer(mode: boolean) {
    const server = new InversifyExpressServer(container);

    server.setConfig((app: express.Application) => {
        app.use(compression());
        app.disable("etag");
        app.use(cors());

        app.use(
            bodyParser.urlencoded({
                extended: true,
                limit: "15mb",
            })
        );

        app.use(
            bodyParser.urlencoded({
                extended: true,
                limit: "15mb",
            })
        );
        app.use(
            `${Constants.Context_Path}/api-docs`,
            swaggerUI.serve,
            swaggerUI.setup(swaggerDoc)
        );
        ContextManager.init(app);
        HttpClient.init("todo-svc");
        ReqContextManager.registerWithReqContextManager(app, 
            [
                `${Constants.Context_Path}/user`,
                `${Constants.Context_Path}/task`
            ],
            [
                `${Constants.Context_Path}/user/login`
            ]);
        app.use(AuthenticationMiddleware.checkAuthentication);
        app.use(bodyParser.json({ limit: "15mb" }));
        app.use(ReqResMiddleware.reqResLog);
        app.use(
            audit({
                auditor: function (event) {
                    logRequestAudit(event);
                },
                excludeURLs: ["health"], // Exclude paths which enclude 'health'
                request: {
                    maskBody: [], // Mask field in incoming requests
                    excludeHeaders: [], // Exclude 'authorization' header from requests
                    excludeBody: [], // Exclude  field from requests body
                    maskHeaders: [], // Mask  header in incoming requests
                    maxBodyLength: 50, // limit length to 50 chars + '...'
                },
                response: {
                    maskBody: [], // Mask 'fieled1' field in response body
                    excludeHeaders: [], // Exclude all("*") headers from responses,
                    excludeBody: [], // Exclude all body from responses
                    maskHeaders: [], // Mask 'header1' header in incoming requests
                    maxBodyLength: 50, // limit length to 50 chars + '...'
                },
            })
        );
        server.setErrorConfig(async (app) => {
            app.use(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                async (
                    err: any,
                    req: Request,
                    res: Response,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    next: express.NextFunction
                ) => {
                    Logger.error(err, err.errId || "UNKNOWN", err.errType || "UNKNOWN");
                    // const production = process.env.NODE_ENV === "production";
                    const errRes = { errors: [] };
                    const error = {
                        code: err.code,
                        details: err.type === "VALIDATION_ERR" ? (Array.isArray(err.details) ?
                            err.details.map(error => {
                                return {
                                    message: error.message,
                                    path: error.path
                                };
                            }) : err.details) : err.details,
                        display_message: "Sorry! Something went wrong!",
                        type: err.type,
                        trace_id: err.traceId,
                    };
                    errRes.errors.push(error);

                    if (err.status) {
                        res.status(parseInt(err.status)).json(errRes);
                    } else {
                        res.status(500).json(errRes);
                    }
                    return;
                }
            );
        });
    });

    const port = parseInt(process.env.TODO_SVC_PORT);

    server.build().listen(port, () => {
        Logger.info(`Listening on port ${port}`);
    });
}

async function getConfig(): Promise<ServiceConfig> {
    Logger.info("Fetching Config Data....");
    try {
        const options = {};
        options["headers"] = Constants.Headers;
        options["method"] = "GET";

        const serviceConfig = await HttpClient.call(
            Constants.Svc_Config_Host,
            `${Constants.Svc_Config_Uri}`,
            options
        );

        process.env["SERVICE_CONFIG"] = JSON.stringify(serviceConfig.config_json);
        Logger.info(JSON.stringify(serviceConfig));
        return serviceConfig;
    } catch (err) {
        Logger.error(err, "", "Error in fetching Config Data");
        process.exit();
    }
}

async function connectToDB(dbConfig: DbConfig): Promise<void> {
    try {
        Logger.debug("DB_CONFIG: ", dbConfig);
        Logger.info("Connecting to db....");
        await createDBConn(dbConfig);
        Logger.info("Connected to db.");
    } catch (err) {
        Logger.error(err, "", "MySql connection error. Please make sure MySql is running.");
        process.exit();
    }
}

async function connectToCache(cacheConfig: CacheConfig): Promise<void> {
    try {
        Logger.debug("CACHE_CONFIG: ", cacheConfig);
        Logger.info("Connecting to Aerospike....");
        await AerospikeAdapter.init(cacheConfig, {});
    } catch (err) {
        Logger.error(err, "", "Aerospike connection error. Please make sure Aerospike is running.");
        process.exit();
    }
}

async function logRequestAudit(event: any) {
    const reqAuditEnabled = process.env.REQUEST_AUDIT_ENABLED || false;
    if (reqAuditEnabled) {
        try {
            const payload: RequestAuditInput = {
                url: event.request.url,
                action: event.request.method,
                data: event,
                status_code: event.response?.status_code,
                trace_id: ReqContextManager.getRequestId() || "Not_Found"
            };
            await sequelizeConn["models"]["RequestAudit"].create(payload);
        } catch (err) {
            Logger.error(err, "Request Audit Error", "Request Audit Error");
        }
    }
}

module.exports.init = init;