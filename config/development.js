// todo: put this in one place and import it
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