/* eslint-disable*/
import { ContextManager } from "../../src/utils/context/ContextManager";
import { Logger } from "../../src/utils/logging/Logger";
import * as sinon from "sinon";
import { ReqContextManager } from "../../src/utils/context/ReqContextManager";
import "reflect-metadata";
import { createDBConn } from "../../src/db-initialization/initialize";
sinon.stub(Logger);
sinon.stub(ContextManager);
const serviceConfig = {
    "config_json": {
        "db_config": {
            "default": {
                "host": "localhost",
                "pool": {
                    "max": 5,
                    "min": 0,
                    "idle": 200000,
                    "acquire": 1000000
                },
                "port": 3306,
                "dialect": "mysql",
                "logging": true,
                "database": "task-db",
                "password": "password",
                "username": "root"
            },
            "replica": {
                "host": "localhost",
                "port": 3306,
                "password": "password",
                "username": "root"
            }
        }
    },
    "cache_config": {
        "host": "localhost:3000",
        "set_prefix": "",
        "namespace": "todo_cache"
    }
}
process.env["SERVICE_CONFIG"] = JSON.stringify(serviceConfig.config_json);
import { expect } from "chai";
const lolex = require('lolex');
import "mocha";
import * as _ from "lodash";
import { UserService } from "../../src/services/UserService";
import {
    UserDal, TaskDal, UserResourceMappingDal, ResourceActionMappingDal
} from "../../src/repositories";
const moment = require('moment-timezone');

const userService = new UserService(new UserDal());

describe("User Management...", async () => {
    let createUserReqObj, response;

    before(async () => {
        createUserReqObj = {
            "first_name": "test",
            "last_name": "test",
            "email": "test@test.com",
            "password": "password",
            "mobile": "9876543210"
        };

        response = {
            "user": {
                "id": 101,
                "first_name": "test",
                "last_name": "test",
                "email": "test@test.com",
                "mobile": "9876543210",
                "is_superuser": 0,
                "created_at": "2024-06-15 16:27:05",
                "updated_at": "2024-06-15 16:27:05"
            },
            "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiMjVhbmt1cnBhbmRleUBnbWFpbC5jb20iLCJpYXQiOjE3MTg0NzQ1NjUsImV4cCI6MTcxODQ3ODE2NX0.INQwHTzDbYS7XbbfcWWSYSLBRqKeXvKRthO25Dgazd0"
        };
        process.env["SERVICE_CONFIG"] = JSON.stringify(serviceConfig.config_json);
    });

    it("Create user(No error)...", async () => {
        sinon.stub(UserDal.prototype, "getUserByEmail").resolves(undefined);

        const service = userService;
        const resp = await service.createUser(createUserReqObj);
        expect(_.isEqual(resp, response)).to.be.true;
    });

    it("Create user(Error condition)...", async () => {
        sinon.stub(UserDal.prototype, "getUserByEmail").resolves(response);

        const service = userService;
        try {
            const resp = await service.createUser(createUserReqObj);
        } catch (err) {
            expect(_.isEqual(err.type, "SYSTEM_ERR") && _.isEqual(err.details.message, "user already exists")).to.be.true;
        }
    });

    afterEach("cleaning up", async () => {
        sinon.restore();
    });

});