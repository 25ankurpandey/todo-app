import { Request, Response, NextFunction } from "express";
import * as express from "express";
import { ContextManager } from "./ContextManager";
import { v4 as uuidv4 } from "uuid";
import * as requestIp from "request-ip";
import { ValidationUtils } from "../ValidationUtils";
import { UserMeta } from "../../interfaces/User";

export class ReqContextManager {

    public static X_TRACKER = "x-tracker";
    public static TRACE_ATTRIBUTES = "traceAttributes";
    public static X_USER = "x-user";
    public static CALLER = "x-caller";
    public static TIMESTAMP = "x-timestamp";
    public static IP_ADDRESS = "ipaddress";
    public static REQ_URL = "requrl";
    public static USER_META = "usermeta";
    private static authorization = "authorization";
    private static urlsToBeAuthenticated: string[];
    private static urlsExcludedFromAuthentication: string[];
    private static urlsToBeAuthorized: string[];
    private static urlsExcludedFromAuthorization: string[];
    private static authenticationRequired = "authenticationRequired";
    private static authorizationRequired = "authorizationRequired";

    public static registerWithReqContextManager(express: express.Application,
        urlsToBeAuthenticated: string[],
        urlsExcludedFromAuthentication: string[],
        urlsToBeAuthorized: string[],
        urlsExcludedFromAuthorization: string[]) {
        ValidationUtils.validateIsNotNullOrUndefined(urlsExcludedFromAuthentication,
            "urlsExcludedFromAuthentication");

        ReqContextManager.urlsToBeAuthenticated = urlsToBeAuthenticated;
        ReqContextManager.urlsExcludedFromAuthentication = urlsExcludedFromAuthentication;
        ReqContextManager.urlsToBeAuthorized = urlsToBeAuthorized;
        ReqContextManager.urlsExcludedFromAuthorization = urlsExcludedFromAuthorization;
        express.use((req: Request, res: Response, next: NextFunction) => {
            ReqContextManager.populateFromHeaders(req, true, true);
            ContextManager.setAttribute(ReqContextManager.IP_ADDRESS,
                req.headers[ReqContextManager.IP_ADDRESS] || requestIp.getClientIp(req));
            ContextManager.setAttribute(ReqContextManager.REQ_URL, req.url);
            next();
        });
    }

    public static populateFromHeaders(req: any,
        checkUrlsToBeExcludedFromAuthentication: boolean,
        checkUrlsToBeExcludedFromAuthorization: boolean): void {
        ReqContextManager.addTraceAttributes(req);
        ReqContextManager.setAttribute(req, ReqContextManager.CALLER, true); // Allow unknown caller
        ReqContextManager.setAttribute(req, ReqContextManager.TIMESTAMP);
        ReqContextManager.setMandatoryHeadersForAuthentication(req, checkUrlsToBeExcludedFromAuthentication);
        ReqContextManager.setMandatoryHeadersForAuthorization(req, checkUrlsToBeExcludedFromAuthorization);
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

    private static setMandatoryHeadersForAuthentication(req: Request, checkUrlsToBeExcludedFromAuthentication = true) {
        if (checkUrlsToBeExcludedFromAuthentication) {
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
                    ContextManager.setAttribute(ReqContextManager.authenticationRequired, true);
                    break;
                }
            }
        }
    }

    private static setMandatoryHeadersForAuthorization(req: Request, checkUrlsToBeExcludedFromAuthorization = true) {
        if (checkUrlsToBeExcludedFromAuthorization) {
            for (const urlToExclude of ReqContextManager.urlsExcludedFromAuthorization) {
                const url: string = req.url;
                if (url.startsWith(urlToExclude)) {
                    return;
                }
            }
        }

        if (req.url && ReqContextManager.urlsToBeAuthenticated.length > 0) {
            for (const url of ReqContextManager.urlsToBeAuthorized) {
                if (req.url.startsWith(url)) {
                    ContextManager.setAttribute(ReqContextManager.authorizationRequired, true);
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

    public static getAuthorizationRequired(): boolean {
        return ContextManager.getAttribute(ReqContextManager.authorizationRequired);
    }

    public static getUrlsToBeAuthenticated(): string[] {
        return ReqContextManager.urlsToBeAuthenticated;
    }

    public static getUrlsToBeAuthorized(): string[] {
        return ReqContextManager.urlsToBeAuthorized;
    }

    public static getToken(): string {
        return ReqContextManager.getAttribute(ReqContextManager.authorization);
    }

    public static getUserMeta(): UserMeta {
        return ReqContextManager.getAttribute(ReqContextManager.USER_META);
    }
}
