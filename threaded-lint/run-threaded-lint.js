const { ESLint } = require("eslint");
const { divvyUp, runLint } = require("./basic-threaded-lint");
const yargs = require("yargs");

const {
  warnIgnored,
  _: [root],
} = yargs
  .option("--warnIgnored", {
    description: "Tells whether to ignore eslint warnings.",
    default: false,
    type: "boolean",
  })
  .help()
  .alias("help", "h").argv;

(async function main() {
  const chunks = await divvyUp(root ? root : "modules");
  await runLint(chunks, warnIgnored);
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
