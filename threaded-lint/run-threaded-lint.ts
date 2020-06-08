import { divvyUp, runLint } from "./basic-threaded-lint";
import * as yargs from "yargs";

const {
  warnIgnored,
  workers,
  _: [rootFile, ...args],
} = yargs
  .option("--warnIgnored", {
    description: "Tells whether to ignore eslint warnings. Defaults to false",
    default: false,
    type: "boolean",
  })
  .option("--workers", {
    description: "Specifies # of threads to spawn. Defaults to 2",
    default: 2,
    type: "number",
  })
  .help()
  .alias("help", "h").argv;

(async function main() {
  const chunks = await divvyUp(rootFile, workers as number);
  await runLint(chunks, warnIgnored as boolean);
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
