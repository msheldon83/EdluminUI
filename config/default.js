var environment = process.env.NODE_ENV || "development";

if (environment !== "production") {
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
  environment: environment,
  minify: process.env.MINIFY === "true",

  production: environment === "production",
  development: environment === "development",
  test: environment === "test",

  trackingId: process.env.TRACKING_ID || "",

  auth0_domain: process.env.AUTH0_DOMAIN || "hcmdev.auth0.com",
  auth0_client:
    process.env.AUTH0_CLIENT_ID || "eLiUtXy2kn7cRvjpl3o7oQGCTlbbxeNS",
  auth0_redirect_url:
    process.env.AUTH0_REDIRECT_URL || "http://localhost:3000/",
  auth0_api_audience: process.env.AUTH0_API_AUDIENCE || "https://hcmdev/api",
  auth0_scope: process.env.AUTH0_SCOPE || "openid profile email",
  auth0_clock_skew_leeway_seconds:
    process.env.AUTH0_CLOCK_SKEW_LEEWAY_SECONDS || 3600,
  apiUrl: "/graphql",
  restUrl: "/",
  isDevFeatureOnly: process.env.IS_DEV_FEATURE_ONLY || true,

  impersonation_actingUserIdKey: "rrActingUserId",
  impersonation_actingOrgUserIdKey: "rrActingOrgUserId",
  impersonation_impersonatingOrgId: "rrImpersonatingOrgId",

  devServer: {
    url: "http://localhost",
    port: 3000,
    hot: true,
    inline: true,
    noInfo: true,
    proxyHost:
      process.env.DEV_SERVER_PROXY_HOST ||
      "https://edlumin-api-dev.azurewebsites.net/",
    disableHostCheck: ["1", "true"].includes(
      process.env.DEV_SERVER_DISABLE_HOST_CHECK
    ),
  },
};
