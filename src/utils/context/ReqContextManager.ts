import { Request, Response, NextFunction } from "express";
import * as express from "express";
import { ContextManager } from "./ContextManager";
import { v4 as uuidv4 } from "uuid";
import * as requestIp from "request-ip";
import { ValidationUtils } from "../ValidationUtils";

export class ReqContextManager {

    public static X_TRACKER = "x-tracker";
    public static TRACE_ATTRIBUTES = "traceAttributes";
    public static X_USER = "x-user";
    public static CALLER = "x-caller";
    public static TIMESTAMP = "x-timestamp";
    public static IP_ADDRESS = "ipaddress";
    public static REQ_URL = "requrl";

    public static registerWithReqContextManager(express: express.Application) {
        express.use((req: Request, res: Response, next: NextFunction) => {
            ReqContextManager.populateFromHeaders(req);
            ContextManager.setAttribute(ReqContextManager.IP_ADDRESS,
                req.headers[ReqContextManager.IP_ADDRESS] || requestIp.getClientIp(req));
            ContextManager.setAttribute(ReqContextManager.REQ_URL, req.url);
            next();
        });
    }

    public static populateFromHeaders(req: any): void {
        ReqContextManager.addTraceAttributes(req);
        ReqContextManager.setAttribute(req, ReqContextManager.X_USER);
        ReqContextManager.setAttribute(req, ReqContextManager.CALLER, true); // Allow unknown caller
        ReqContextManager.setAttribute(req, ReqContextManager.TIMESTAMP);
    }

    private static setAttribute(req: any, attribName: string, ignoreMissingHeaders = false) {
        let attribValue: any = req.headers[attribName.toLowerCase()] || req.headers[attribName];

        if (!ignoreMissingHeaders) {
            ValidationUtils.validateStringNotEmpty(attribValue, attribName);
        } else {
            attribValue = attribValue || "UNKNOWN";
        }

        ContextManager.setAttribute(attribName, attribValue);
    }

    public static validateHeaders(req: Request, headersToBeValidated: string[]) {
        headersToBeValidated.forEach(header => {
            const value = req.headers[header];
            ValidationUtils.validateStringNotEmpty(value, `Header ${header}`);
        });
    }

    private static addTraceAttributes(req: Request): void {
        const requestId = req.headers[ReqContextManager.X_TRACKER] || req.headers[ReqContextManager.X_TRACKER.toUpperCase()] || uuidv4();
        const traceAttributes: { [key: string]: string | string[] } = { requestId };
        ContextManager.setAttribute(ReqContextManager.X_TRACKER, requestId);
        ContextManager.setAttribute(ReqContextManager.TRACE_ATTRIBUTES, traceAttributes);
    }

    private static getAttribute(attribName: string): any {
        return ContextManager.getAttribute(attribName);
    }

    public static getTimeStamp(): string {
        return ReqContextManager.getAttribute(ReqContextManager.TIMESTAMP);
    }

    public static getReqUrl(): string {
        return ReqContextManager.getAttribute(ReqContextManager.REQ_URL);
    }

    public static getUserId(): string {
        return ReqContextManager.getAttribute(ReqContextManager.X_USER);
    }

    public static getTraceAttributes(): string {
        return ContextManager.getAttribute(ReqContextManager.TRACE_ATTRIBUTES);
    }

    public static getCaller(): string {
        return ReqContextManager.getAttribute(ReqContextManager.CALLER);
    }

    public static getIpAddress(): string {
        return ReqContextManager.getAttribute(ReqContextManager.IP_ADDRESS);
    }

    public static getRequestId(): any {
        return ReqContextManager.getAttribute(ReqContextManager.X_TRACKER);
    }
}
