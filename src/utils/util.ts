import to from "await-to-js";
import { Logger } from "./logging/Logger";

export const tryCatchWrapper = async function (task): Promise<any[]> {
    const [err, res] = await to(task);
    if (err) Logger.error(err, "", "tcwrapper");
    return [err, res];
};