/* eslint-disable @typescript-eslint/no-explicit-any */
import superagent from "superagent";
import { Logger } from "../logging/Logger";
import { ErrUtils } from "../ErrUtils";
import { ReqContextManager } from "../context/ReqContextManager";
import { ValidationUtils } from "../ValidationUtils";

export class HttpClient {
    private static service: string;

    public static init(service: string) {
        ValidationUtils.validateIsNotNullOrUndefined(service, "service");
        HttpClient.service = service;
    }

    public static async call(service: string, uri: string, options: any, addDefautHeaders = true) {
        if (!HttpClient.service) {
            ErrUtils.throwSystemError("The HttpClient has not been initialized. Please initialize it at bootstrap time", "HTTPCLIENT_NOT_INITIALIZED");
        }

        const host = HttpClient.getServiceUrl(service);
        options.url = `${host}${uri}`;

        let contentType = "application/json";

        if (options.body) {
            options.json = options.body;
            delete options.body;
        } else if (options.formdata) {
            options.json = options.formdata;
            contentType = "multipart/form-data";
            delete options.formdata;
        }
        let query: { [s: string]: string | number } = options.query;
        if (!query) {
            query = {};
            options.query = query;
        }

        let headers: { [s: string]: string | number } = options.headers;

        if (!headers) {
            headers = {};
            options.headers = headers;
        }

        if (addDefautHeaders) {
            headers = HttpClient.populateHeaders(headers, service, contentType);
        }

        for (const header of Object.keys(headers)) {
            if (!headers[header]) {
                delete headers[header];
            }
        }
        let result: any = {};
        Logger.debug(`Calling host: ${host} with uri: ${uri} and body: ${JSON.stringify(options.json)} and headers: ${JSON.stringify(headers)}`);
        if (options.method === "POST" || options.method === "PUT" || options.method === "PATCH") {
            if (contentType === "application/json") {
                result = await superagent(options.method, options.url).
                    set(headers).
                    query(options.query).
                    send(options.json).
                    retry(parseInt(process.env.TPL_HTTP_REQUEST_RETRY_COUNT)).
                    use(HttpClient.logResponseTime());
            } else if (contentType === "multipart/form-data") {
                result = await superagent(options.method, options.url).
                    set(headers).
                    query(options.query).
                    type("form").
                    field(options.json).
                    retry(parseInt(process.env.TPL_HTTP_REQUEST_RETRY_COUNT) || 3).
                    use(HttpClient.logResponseTime());
            }
        } else if (options.method === "GET" || options.method === "DELETE") {
            result = await superagent(options.method, options.url).
                set(headers).
                query(options.query).
                retry(parseInt(process.env.TPL_HTTP_REQUEST_RETRY_COUNT) || 3).
                use(HttpClient.logResponseTime());
        }
        return JSON.parse(result.text);
    }

    static getServiceUrl(service: string) {
        return process.env[service];
    }
    static populateHeaders(headers: { [s: string]: string | number; }, service: string, contentType: string) {
        headers["Content-Type"] = contentType;
        headers["X-Timestamp"] = ReqContextManager.getTimeStamp() !== "UNKNOWN" ? ReqContextManager.getTimeStamp() : new Date().toISOString();
        headers["X-Tracker"] = ReqContextManager.getRequestId();
        return headers;
    }

    static logResponseTime() {
        return function (req: superagent.SuperAgentRequest) {
            const startAt = process.hrtime();
            req.on("end", function () {
                const diff = process.hrtime(startAt);
                const time = diff[0] * 1e3 + diff[1] * 1e-6;
                Logger.info("Time taken by the HTTP request", { "url": req.url, "timeInMs": time });
            });
        };
    }

}