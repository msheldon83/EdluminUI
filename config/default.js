if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    silent: false,
  });
}

const CONCURRENCY = parseInt(process.env.WEB_CONCURRENCY, 10) || 1;

// function definedOr<T> (x: (T | null | undefined), fallback: T) { // oh yeah, this isn't TS =\
function definedOr(x, fallback) {
  // to e.g. tolerate user specifying '0'
  if (x == null || x == undefined) {
    return fallback;
  } else {
    return x;
  }
}

module.exports = {
  environment: process.env.NODE_ENV,
  minify: process.env.MINIFY === "true",

  production: process.env.NODE_ENV === "production",
  development: process.env.NODE_ENV === "development",
  test: process.env.NODE_ENV === "test",

  devServer: {
    url: "http://localhost",
    port: 3000,
    hot: true,
    inline: true,
    noInfo: true,
    proxyHost: process.env.DEV_SERVER_PROXY_HOST || null,
    disableHostCheck: ["1", "true"].includes(
      process.env.DEV_SERVER_DISABLE_HOST_CHECK
    ),
  },
};
