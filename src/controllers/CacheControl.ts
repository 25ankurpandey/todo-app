import { Request, Response } from "express";
import { Logger } from "../utils/logging/Logger";
import { AerospikeAdapter } from "../utils/caching/AerospikeAdapter";
import { controller, httpGet, httpPost, results } from "inversify-express-utils";
import { Constants } from "../constants/Constants";
import { BaseController } from "./Base";
import { ErrUtils } from "../utils/ErrUtils";

@controller(`${Constants.Context_Path}/cache/sets`)

export class CacheControlController extends BaseController {
    constructor() {
        super();
    }

    @httpGet("/set-size")
    public async getSetSize(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.set_name) {
                throw new Error("No set name provided")
            }
            const setName = req.query.set_name + "";
            const setSize = await AerospikeAdapter.getSetSize(setName);
            res.send({set_size: setSize});
        } catch (err) {
            Logger.error(err, "400", "Cache error");
            ErrUtils.throwSystemError("CACHE_ERROR", { message: err.message });
        }
    }

    @httpPost("/clear")
    public async clearSet(req: Request, res: Response): Promise<void> {
        try {
            if (!req.query.set_name) {
                throw new Error("No set name provided")
            }
            const setName = req.query.set_name + "";
            const recordsDeleted = await AerospikeAdapter.truncateSetbyName(setName);
            res.send({no_records_deleted: recordsDeleted});
        } catch (err) {
            Logger.error(err, "400", "Cache truncation error");
            ErrUtils.throwSystemError("CACHE_ERROR", { message: err.message });
        }
    }
}
