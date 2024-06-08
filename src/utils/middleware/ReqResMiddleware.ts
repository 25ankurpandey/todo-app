/*
 This middleware can be used to
 1. Log when a request arrives and when it finishes
 2. Log totalResponseTimeInMS

 Note: Only applicable for Express
*/
import * as express from "express";
import { Logger } from "../logging/Logger";

export class ReqResMiddleware {
 
    public static reqResLog(req: express.Request, res: express.Response, next: express.NextFunction) {
        const startTime = process.hrtime();

        Logger.info("Request received:");

        res.on("finish", () => {
            const totalTime = process.hrtime(startTime);
            const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;
            Logger.info("Request completed:", { "totalTimeInMs": totalTimeInMs });
        });
        next();
    } 
}