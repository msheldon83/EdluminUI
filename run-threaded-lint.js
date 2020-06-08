const { divvyUp, runLint } = require("./basic-threaded-lint");

(async function main() {
    const [chunks, ,] = await divvyUp("modules");
    await runLint(chunks);
})().catch(error => {
    process.exitCode = 1;
    console.error(error);
});
