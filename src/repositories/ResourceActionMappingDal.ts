import { Op, where } from "sequelize";
import { sequelizeConn } from "../db-initialization/initialize";
import { provideSingleton } from "../ioc/ioc";
import { ResourceActionMappingInput, ResourceActionMappingOutput } from "../models/ResourceActionMapping";
import { Logger } from "../utils/logging/Logger";
import { includes } from "lodash";

@provideSingleton(ResourceActionMappingDal)
export class ResourceActionMappingDal {

    async getResourceActions(resources: any[]): Promise<any[]> {
        const resourceIds = Object.keys(resources);
        const actions = await sequelizeConn.models.ResourceActionMapping.findAll({
            attributes: ["resource_id"],
            where: {
                resource_id: {
                    [Op.in]: resourceIds
                }
            },
            include: [
                {
                    model: sequelizeConn.models.Action,
                    as: "action",
                    attributes: ["id", "action"]
                }
            ]
        });

        const actionRes = actions.reduce((result, action) => {
            const resourceName = resources[`${action.resource_id}`];
            if (!result[resourceName]) {
              result[resourceName] = { actions: [] };
            }
            result[resourceName].actions.push(action.action.action);
            return result;
          }, {});

        console.log("88888888888888888888888888888888", JSON.stringify(actionRes))
        return actionRes; 
    }
}