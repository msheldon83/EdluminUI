var shell = require("shelljs");

var silentState = shell.config.silent;
shell.config.silent = true;
shell
  .cat(process.env.SERVER_SCHEMA_PATH || "../HCMServer/src/schema.graphql")
  //.exec("yarn run --silent prettier --parser graphql")
  .to("modules/graphql/server-schema.graphql");
shell.config.silent = silentState;
