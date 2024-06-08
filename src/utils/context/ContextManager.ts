import { ValidationUtils } from "../ValidationUtils";
import { Request, Response, NextFunction } from "express";
import * as express from "express";
import * as cls from "cls-hooked";

/**
 * This class provides methods that allow the caller to store and retrieve
 * objects from the request context. Also, provides additional convenience
 * methods for transaction context and security context management.
 */
export class ContextManager {

  private static NAMESPACE_NAME = "session";

  private static initialized = false;

  /**
   * Initializes the Context service. Call this method before
   * you invoke any other methods in this class.
   * @param app Instance of the express app
   */
  public static init(app: express.Application): void {
    cls.createNamespace(ContextManager.NAMESPACE_NAME);

    if (app) {
      app.use(async (req: Request, res: Response, next: NextFunction) => {
        const nameSpace = cls.getNamespace(ContextManager.NAMESPACE_NAME);
        nameSpace.bindEmitter(req);
        nameSpace.bindEmitter(res);

        await nameSpace.runPromise(async () => {
          await next();
        });
      });
    }

    ContextManager.initialized = true;
    console.log("Successfully initialized ContextManager");
  }

  public static initCustomContext(service: any) {
    const ns = ContextManager.getNameSpace();
    ns.bind(service, ns.createContext());
    return ns;
  }

  public static getNameSpace() {
    ContextManager.validateInitialization();

    return cls.getNamespace(ContextManager.NAMESPACE_NAME);
  }

  private static validateInitialization() {
    if (!ContextManager.initialized) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = new Error("ContextManager not initialized. Please intitialize before invoking");
      err.errId = "CONTEXT_MGR_NOT_INITIALIZED";

      throw err;
    }
  }

  /**
   * Sets the provided value into the request context for the given key.
   * 
   * @param key The key corresponding to which value needs to be stored
   * @param value The value 
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static setAttribute(key: string, value: any): void {
    ContextManager.validateInitialization();

    ValidationUtils.validateStringNotEmpty(key, "key");
    ValidationUtils.validateIsNotNullOrUndefined(value, "value");

    const nameSpace: cls.Namespace =
      cls.getNamespace(ContextManager.NAMESPACE_NAME);
    nameSpace.set(key, value);
  }

  /**
   * Gets the value for the key from the request context.
   * 
   * @param key The key for which the value is to be retrieved from the
   * request context.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static getAttribute(key: string): any {
    ContextManager.validateInitialization();
    ValidationUtils.validateStringNotEmpty(key, "key");

    const nameSpace: cls.Namespace = cls.getNamespace(ContextManager.NAMESPACE_NAME);

    return nameSpace.get(key);
  }

  public static reset() {
    ContextManager.initialized = false;

    try {
      cls.destroyNamespace(ContextManager.NAMESPACE_NAME);
    } catch (err) {
      console.log("Error while resetting the context");
    }
  }

}