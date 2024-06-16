import { TaskDal, UserDal } from "./repositories";
import { ReminderService } from "../src/services/ReminderService";
import * as process from "process";
import { Logger } from "./utils/logging/Logger";
import { ReqContextManager } from "./utils/context/ReqContextManager";

async function cron() {
    Logger.init("todo-svc");
    require("dotenv").config();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    await require("./bootstrap").init();
    const mode = process.argv[2];
    switch (mode) {
        case "send-reminder": {
            try {
                const reminderService = new ReminderService(new TaskDal(), new UserDal());
                Logger.info("Reminder cron triggered...");
                await reminderService.sendReminders();
                Logger.info("Reminder cron ended...");
                return ({ success: true });
            } catch (err) {
                Logger.error(err, "400", "REMINDER_CRON_ERR");
                throw err;
            }
        }
    }
}

async function execute() {
    try {
        await cron();
        Logger.info("job completed");
        process.exit();
    } catch (err) {
        Logger.error(err, "REMINDER_CRON_ERR", "REMINDER_CRON_ERR");
    }
}
execute();






