/* eslint-disable max-lines-per-function */
/* eslint-disable max-depth */
/*
 This middleware can be used to
 1. check Authorization for the urls which needs authorisation
 2. Set user meta, access level ids in context

 Note: Only applicable for Express
*/
import express from "express";
import { ReqContextManager } from "../context/ReqContextManager";
import { Logger } from "../logging/Logger";
import { ErrUtils } from "../ErrUtils";
import { ContextManager } from "../context/ContextManager";
import { AuthorizationMiddlewareConfigValidationSchema } from "../../validators/validationSchemas";
import { ValidationUtils } from "../ValidationUtils";
import { UserResourceMappingDal } from "../../repositories/UserResourceMappingDal";
import { UserDal } from "../../repositories";
import { ResourceActionMappingDal } from "../../repositories/ResourceActionMappingDal";

interface AuthzConfig {
    excluded_paths?: string[],
    resource_urls: any,
    accepted_actions: string[],
}

export class AuthorizationMiddleware {

    private static config: AuthzConfig;

    public static async init(config: AuthzConfig) {
        const value = await AuthorizationMiddlewareConfigValidationSchema.validateAsync(config);
        AuthorizationMiddleware.config = value;
    }

    private async fetchUserAuthDetails() {
        try {
            ValidationUtils.validateIsNotNullOrUndefined(ReqContextManager.getUserMeta(), "Header usermeta");
            const userId = ReqContextManager.getUserMeta().id;
            Logger.debug(`fetching user auth Details with userId: ${userId}`);

            const [userMeta, userResources] = await Promise.all([
                new UserDal().getUser({
                    attributes: { exclude: ["password", "created_at", "updated_at"] },
                    where: { id: userId }
                }),
                new UserResourceMappingDal().getUserResources(userId)
            ]);

            const resourceActions = await new ResourceActionMappingDal().getResourceActions(userResources)
            Logger.debug(`User auth Details: ${JSON.stringify(resourceActions)}`);
            return {privileges: resourceActions, meta: userMeta};
        }
        catch (err) {
            Logger.error(err, "500", "fetch user auth details");
            ErrUtils.throwSystemError("System Error", { message: "Something went wrong" });
        }
    }

    public static async checkAuthorization(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!ReqContextManager.getAuthorizationRequired()) {
            return next();
        }
        const { privileges, meta } = await new AuthorizationMiddleware().fetchUserAuthDetails();
        ContextManager.setAttribute(ReqContextManager.USER_META, meta);

        let url = req.path;
        if (url.charAt(url.length - 1) === "/") url = url.substring(0, url.length - 1);
        if (!AuthorizationMiddleware.config.resource_urls[url] && !AuthorizationMiddleware.config.excluded_paths.includes(url)) {
            const authUrls = ReqContextManager.getUrlsToBeAuthorized();
            for (const authUrl of authUrls) {
                if (req.path.startsWith(authUrl)) {
                    const startIndex = req.path.indexOf(authUrl) + authUrl.length;
                    url = req.path.substring(startIndex, req.path.lastIndexOf("/"));
                    const index = url.indexOf("/", url.indexOf("/") + 1);
                    const extractedString = index === -1 ? url : url.substring(0, index);
                    url = authUrl.concat(extractedString);
                }
            }
        }
        if (meta.is_superuser || AuthorizationMiddleware.config.excluded_paths.includes(url)) {
            return next();
        }
        const { resources, action_required } = AuthorizationMiddleware.config.resource_urls[url][req.method.toLowerCase()];
        let resourcePresent = false;
        let actionFound = false;
        for (const resource of resources) {
            let actions: string[] = [], actionsSet = new Set([]);
            const resourcePrivilege = privileges[resource];
            if (resourcePrivilege) {
                resourcePresent = true;
                actions = actions.concat(resourcePrivilege.actions);
                actionsSet = new Set(actions);
                if (actionsSet.has(action_required)) {
                    actionFound = true;
                    break;
                }
            }
        }
        if (!resourcePresent || !actionFound) {
            ErrUtils.throwPermissionError("Permission error", { message: "You do not have " + action_required + " permission on " + resources });
        }
        next();
    }
}