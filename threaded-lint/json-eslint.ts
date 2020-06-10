import { ESLint } from "eslint";
import { promises as fs } from "fs";
import * as yargs from "yargs";

const {
  warnIgnored,
  //configPath,
  _: [out, ...files],
} = yargs
  .option("--warnIgnored", {
    description: "Tells whether to ignore eslint warnings.",
    default: false,
    type: "boolean",
  })
  .help()
  .alias("help", "h").argv;

const purgeWarnings = (result: ESLint.LintResult): ESLint.LintResult => ({
  ...result,
  messages: result.messages.filter(m => m.severity == 2),
  fixableWarningCount: 0,
  warningCount: 0,
});

(async function main() {
  const eslint = new ESLint(/*{ overrideConfigFile: configPath as string }*/);
  const results = await eslint.lintFiles(files);
  await fs.writeFile(
    out,
    JSON.stringify(warnIgnored ? results.map(purgeWarnings) : results)
  );
  console.log(out);
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
