const {
	divvyUp,
	runLint,
} = require("../dist/threaded-lint/basic-threaded-lint");

(async function main() {
	const chunks = await divvyUp("modules");
	console.log(chunks);
	await runLint(chunks);
})().catch(error => {
	process.exitCode = 1;
	console.error(error);
});
