var shell = require("shelljs");

async function sleep(t) {
  await new Promise(r => setTimeout(r, t));
}
sleep(5000);
var silentState = shell.config.silent;
shell.config.silent = true;
shell
  .cat(process.env.SERVER_SCHEMA_PATH)
  .exec("yarn run --silent prettier --parser graphql")
  .to("modules/graphql/server-schema.graphql");
shell.config.silent = silentState;
