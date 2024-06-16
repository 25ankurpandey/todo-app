import { inject } from "inversify";
import { Logger } from "../utils/logging/Logger";
import { BaseService } from "./BaseService";
import { TaskDal, UserDal } from "../repositories";
import { provideSingleton } from "../ioc/ioc";
import { ErrUtils } from "../utils/ErrUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import nodemailer from "nodemailer";
import { ReminderMethod } from "../interfaces/Task";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Kolkata");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});

@provideSingleton(ReminderService)
export class ReminderService extends BaseService {

    constructor(
        @inject(TaskDal)
        public taskDal: TaskDal,
        @inject(UserDal)
        public userDal: UserDal
    ) {
        super();
    }

    async sendReminders(): Promise<any> {
        try {
            const reminderTaskList = await this.taskDal.getTasksforReminders();
            console.log(JSON.stringify(reminderTaskList))
            const now = dayjs().tz("Asia/Kolkata");;
            for (const task of reminderTaskList) {
                try {
                    if (task.user.reminder_method === ReminderMethod.EMAIL) {
                        await this.sendEmailReminder(task);
                    }
                    if (task.user.reminder_method === ReminderMethod.PUSH) {
                        await this.sendPushNotification(task);
                    }
                    await task.update({ reminder_sent: true });
                } catch (error) {
                    Logger.error(
                        error,
                        "",
                        `Error sending reminder for task ${task.id}: ${error.message}`
                    );
                }
            }
        } catch (err) {
            Logger.error(err, "", "REMINDER_SERVICE_ERROR");
            ErrUtils.throwSystemError("SYSTEM_ERR", { message: err.message });
        }
    }

    private async sendEmailReminder(task: any): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: task.user.email,
            subject: `Reminder: ${task.title}`,
            text: `This is a reminder for your task: ${task.title}. It is due on ${dayjs(task.due_date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm')}.`,
        };

        try {
            await transporter.sendMail(mailOptions);
            Logger.info(`Email reminder sent successfully to ${task.user.email}`);
        } catch (error) {
            Logger.error(error, "", `Error sending email to ${task.user.email}`);
        }
    }


    private async sendPushNotification(task: any) {
        //@TODO yet to implement
        throw new Error("Function not implemented.");
    }
}


