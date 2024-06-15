import { where } from "sequelize";
import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { UserResourceMappingInput, UserResourceMappingOutput } from "../models/UserResourceMapping";
import { Logger } from "../utils/logging/Logger";
import { includes } from "lodash";

@provideSingleton(UserResourceMappingDal)
export class UserResourceMappingDal {

    async getUserResources(user_id: number): Promise<any> {
        const userResources = await sequelizeConn["models"]["UserResourceMapping"].findAll({
            attributes: [],
            include: [
                {
                    model: sequelizeConn["models"]["Resource"],
                    as: "resource",
                    attributes: ["resource_name", "id"]
                }
            ],
            where: {
                user_id: user_id
            }
        });

        const resourceMap = {};
        userResources.forEach(userResource => {
            resourceMap[userResource.resource.id] = userResource.resource.resource_name;
        });
        return resourceMap;
    }

    async create(payload: UserResourceMappingInput): Promise<UserResourceMappingOutput> {
        return await sequelizeConn["models"]["UserResourceMapping"].create(payload);
    }

    async delete(id: number): Promise<UserResourceMappingOutput> {
        return await sequelizeConn["models"]["UserResourceMapping"].destroy({
            where: {
                id: id
            }
        });
    }
}