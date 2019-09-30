/*
Cause unhandled promise rejection to fail the build. (otherwise e.g. the storybook build can silently fail in CI). In the future this will be default node behavior we'll be able to remove it.
https://medium.com/@dtinth/making-unhandled-promise-rejections-crash-the-node-js-process-ffc27cfcc9dd
*/
process.on("unhandledRejection", up => {
  throw up;
});

function envVarOrBust(s) {
  if (!s) {
    var e =
      "\n\n" +
      "========== CONFIGURATION ERROR! ==========\n" +
      "  Database env var is absent.             \n" +
      "  Did you symlink .env.example to .env?   \n" +
      "==========================================\n\n";
    console.log(e);
    throw e;
  }
  return s;
}

module.exports = {};
