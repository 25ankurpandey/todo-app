import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { UserInput, UserOutput } from "../models/UserAttributes";
import { ReqContextManager } from "../utils/context/ReqContextManager";

@provideSingleton(UserDal)
export class UserDal {

    async create(payload: UserInput): Promise<UserOutput> {
        return await sequelizeConn["models"]["UserAttributes"].create(payload);
    }

    async update(payload: UserInput): Promise<UserOutput> {
        const userEmail = ReqContextManager.getUserMeta();
        await sequelizeConn["models"]["UserAttributes"].update(payload, {
            where: {
                "email": userEmail,
            }
        });

        const updatedUser = await sequelizeConn["models"]["UserAttributes"].findOne({
            where: {
                "email": userEmail,
            }
        });
        return updatedUser;
    }

    async getUserByEmail(userEmail: string): Promise<Partial<UserOutput>> {
        return await sequelizeConn["models"]["UserAttributes"].findOne({
            where: {
                email: userEmail
            }
        });
    }

    async getUserId(userEmail: string): Promise<Partial<UserOutput>> {
        const userId = await sequelizeConn["models"]["UserAttributes"].findOne({
            attributes: ["id"],
            where: {
                email: userEmail
            }
        });
        return userId.id;
    }
}