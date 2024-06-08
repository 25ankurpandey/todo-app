/* eslint-disable indent */
module.exports = {
    swaggerDefinition: {
      info: {
        title: "tpl-serviceability-svc",
        version: "1.0.0",
      }, securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header"
        },
      }
    },
    apis: ["./src/controllers/**/*.ts"],
    basePath: "/"
  };