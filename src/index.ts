/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import { Logger } from "./utils/logging/Logger";

async function init() {
  require("dotenv").config();
  Logger.init("todo-svc");
  Logger.info("todo-svc");
  require("./bootstrap").init();
}

init();
