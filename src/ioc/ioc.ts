import "reflect-metadata";
import { fluentProvide } from "inversify-binding-decorators";
import { Container, interfaces } from "inversify";


export const provideSingleton = function (
  identifier: interfaces.ServiceIdentifier<any>
) {
  return fluentProvide(identifier).inSingletonScope().done();
};

export const container = new Container();