import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { UserInput, UserOutput } from "../models/UserAttributes";

@provideSingleton(UserDal)
export class UserDal {

    async create(payload: UserInput): Promise<UserOutput> {
        return await sequelizeConn["models"]["UserAttributes"].create(payload);
    }

    async getUserByEmail(userEmail: string): Promise<Partial<UserOutput>> {
        return await sequelizeConn["models"]["UserAttributes"].findOne({
            where: {
                email: userEmail
            }
        });
    }
}