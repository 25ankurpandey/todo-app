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
    private static authorization = "authorization";
    private static urlsToBeAuthenticated: string[];
    private static urlsExcludedFromAuthentication: string[];
    private static authenticationRequired = "authenticationRequired";

    public static registerWithReqContextManager(express: express.Application, urlsToBeAuthenticated: string[], urlsExcludedFromAuthentication: string[]) {
        ValidationUtils.validateIsNotNullOrUndefined(urlsExcludedFromAuthentication,
            "urlsExcludedFromAuthentication");

        ReqContextManager.urlsToBeAuthenticated = urlsToBeAuthenticated;
        ReqContextManager.urlsExcludedFromAuthentication = urlsExcludedFromAuthentication;
        express.use((req: Request, res: Response, next: NextFunction) => {
            ReqContextManager.populateFromHeaders(req, true);
            ContextManager.setAttribute(ReqContextManager.IP_ADDRESS,
                req.headers[ReqContextManager.IP_ADDRESS] || requestIp.getClientIp(req));
            ContextManager.setAttribute(ReqContextManager.REQ_URL, req.url);
            next();
        });
    }

    public static populateFromHeaders(req: any, checkUrlsToBeExcluded: boolean): void {
        ReqContextManager.addTraceAttributes(req);
        ReqContextManager.setAttribute(req, ReqContextManager.X_USER);
        ReqContextManager.setAttribute(req, ReqContextManager.CALLER, true); // Allow unknown caller
        ReqContextManager.setAttribute(req, ReqContextManager.TIMESTAMP);
        ReqContextManager.validateMandatoryHeaders(req, checkUrlsToBeExcluded);
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

    private static validateMandatoryHeaders(req: Request, checkUrlsToBeExcluded = true) {
        if (checkUrlsToBeExcluded) {
            for (const urlToExclude of ReqContextManager.urlsExcludedFromAuthentication) {
                const url: string = req.url;
                if (url.startsWith(urlToExclude)) {
                    return;
                }
            }
        }

        if (req.url && ReqContextManager.urlsToBeAuthenticated.length > 0) {
            for (const url of ReqContextManager.urlsToBeAuthenticated) {
                if (req.url.startsWith(url)) {
                    ReqContextManager.setAttribute(req, ReqContextManager.authorization);
                    ContextManager.setAttribute(ReqContextManager.authenticationRequired, true);
                    break;
                }
            }
        }
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

    public static getAuthenticationRequired(): boolean {
        return ContextManager.getAttribute(ReqContextManager.authenticationRequired);
    }

    public static getUrlsToBeAuthenticated(): string[] {
        return ReqContextManager.urlsToBeAuthenticated;
    }

    public static getToken(): string {
        return ReqContextManager.getAttribute(ReqContextManager.authorization);
    }
}
