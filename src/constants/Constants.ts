import { v4 as uuidv4 } from "uuid";

export class Constants {
    public static Context_Path = "/todo-svc/v1";
    public static Headers = {
        "cache-control": "no-cache",
        "content-type": "application/json",
        "x-caller": "todo-svc",
        "x-timestamp": new Date((new Date()).getTime() + (5.5 * 60 * 60 * 1000)),
        "x-tracker": uuidv4(),
    };
    public static Svc_Config_Host = "TODO_SVC_CONFIG_HOST";
    public static Svc_Config_Uri = "/config";
    public static Jwt_Token_Expiration = "1h";
    public static Valid_Sort_By_Options = ["created_at", "priority"];
    public static Valid_Sorting_Strategies = ["ASC", "DESC"];
}