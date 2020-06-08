import { divvyUp, runLint } from "./basic-threaded-lint";
import * as yargs from "yargs";

const {
  warnIgnored,
  _: [rootFile, ...args],
} = yargs
  .option("--warnIgnored", {
    description: "Tells whether to ignore eslint warnings.",
    default: false,
    type: "boolean",
  })
  .help()
  .alias("help", "h").argv;

(async function main() {
  const chunks = await divvyUp(rootFile);
  console.log(chunks);
  await runLint(chunks, warnIgnored as boolean);
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
