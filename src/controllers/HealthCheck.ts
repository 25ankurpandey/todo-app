import { Request, Response } from "express";
import { controller, httpGet } from "inversify-express-utils";
import { Constants } from "../constants/Constants";
import * as os from "os";
import { HealthResponse } from "../interfaces/Configs";
import { BaseController } from "./Base";
import { sequelizeConn } from "../db-initialization/initialize";
import { ServiceConfig } from "../interfaces/Configs";
import _ = require("lodash");
import { Logger } from "../utils/logging/Logger";
import { AerospikeAdapter } from "../utils/caching/AerospikeAdapter";
import { tryCatchWrapper } from "../utils/util";

@controller(`${Constants.Context_Path}/health`)
export class HealthCheckController extends BaseController {
  constructor() {
    super();
  }

  @httpGet("/")
  public async checkHealth(req: Request, res: Response): Promise<void> {
    const healthResponse: HealthResponse = {
      HOST: process.env.K8S_POD_NAME,
      uptime: os.uptime().toString(),
      SLA: process.env.SLA_MS,
      version: process.env.IMAGE_TAG,
      finalstatus: "up",
    };
    try {
      const serviceConfig: ServiceConfig = JSON.parse(process.env["SERVICE_CONFIG"]);
      const details = req.query.details;
      const [[dbFinalStatus, dbStats], aeroStatus] = await Promise.all([
        this.checkDBAlive(serviceConfig), this.checkAeroAlive(serviceConfig)
      ]);
      if (dbFinalStatus === "down" || aeroStatus === "down") {
        healthResponse.finalstatus = "down";
      }

      if (details === "true") {
        const dependencies = {
          mysql: dbFinalStatus,
          aerospike: aeroStatus,
        };
        dependencies.mysql = dbStats;
        dependencies.aerospike = aeroStatus;
        healthResponse.dependencies = dependencies;
      }
      res.status(200).send(healthResponse);
    } catch (err) {
      Logger.error(err, "", "Health check error");
      healthResponse.finalstatus = "down";
      res.status(500).send(healthResponse);
    }
  }
  async checkAeroAlive(serviceConfig: ServiceConfig): Promise<string> {
    const tenantIds = Object.keys(serviceConfig);
    const client = _.get(AerospikeAdapter, ["aerospikeClient", "conn"]);
    return (await client.isConnected()) ? "up" : "down";
  }
  async checkDBAlive(serviceConfig: ServiceConfig): Promise<[string, any]> {
    let dbFinalStatus = "up";
    const mysqlConn = sequelizeConn.conn;
    const [err, result] = await tryCatchWrapper(mysqlConn.query("select 1 from dual"));
    let response;
    if (err) {
      dbFinalStatus = "down";
      response = { status: result.status === "fulfilled" ? "up" : "down" };
    }
    return [dbFinalStatus, response];
  }
}