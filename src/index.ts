/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import { Logger } from "./utils/logging/Logger";

async function init() {
  require("dotenv").config();
  initNewRelic();
  Logger.init("todo-svc");
  Logger.info("todo-svc");
  require("./bootstrap").init();
}

function initNewRelic() {
  const newRelicEnabled = process.env.NEW_RELIC_ENABLED || false;

  if (newRelicEnabled) {
    require("newrelic");
  }
}

init();
