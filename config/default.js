if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    silent: false,
  });
}

const CONCURRENCY = parseInt(process.env.WEB_CONCURRENCY, 10) || 1;
const WORKER_CONCURRENCY =
  parseInt(process.env.WORKER_CONCURRENCY, 10) || CONCURRENCY;

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
  databaseUrl: process.env.DATABASE_URL,
  minify: process.env.MINIFY === "true",

  production: process.env.NODE_ENV === "production",
  development: process.env.NODE_ENV === "development",
  test: process.env.NODE_ENV === "test",

  redis: {
    url: process.env.REDIS_URL,
    prefix: process.env.REDIS_PREFIX || "placement:",
  },

  rollbar: {
    serverAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || null,
    clientAccessToken: process.env.ROLLBAR_CLIENT_ACCESS_TOKEN || null,
  },

  auth: {
    idpPublicCert: process.env.IDP_PUBLIC_CERT || null,
    identityProviderHostLogin: process.env.IDENTITY_PROVIDER_HOST_LOGIN || null,
    identityProviderHostLogout:
      process.env.IDENTITY_PROVIDER_HOST_LOGOUT || null,
  },

  devServer: {
    url: "http://localhost",
    port: 3000,
    hot: true,
    inline: true,
    noInfo: true,
    disableHostCheck: ["1", "true"].includes(
      process.env.DEV_SERVER_DISABLE_HOST_CHECK
    ),
  },

  server: {
    port: process.env.PORT || 3001,
    apiHost: process.env.API_HOST || "localhost:3001",
    basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || null,
    enableDeveloperLogin: process.env.ENABLE_DEVELOPER_LOGIN || false,
    secret: process.env.SERVER_SECRET,

    jobAwardDelaySeconds: definedOr(
      process.env.JOB_AWARD_DELAY_SECONDS,
      5 * 60
    ),

    knexLogFormat: process.env.KNEX_LOG_FORMAT || "text",

    publicHost: process.env.PUBLIC_HOST || "localhost:3000",
    requireSsl: process.env.REQUIRE_SSL !== "false",
    protocol: process.env.REQUIRE_SSL ? "https" : "http",

    graphiql: false,
    workers: CONCURRENCY,
    cluster: CONCURRENCY > 1,

    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER,

    rebrandlyApiKey: process.env.REBRANDLY_API_KEY || null,

    newRelicEnabled: process.env.NEW_RELIC_LICENSE_KEY || false,

    smtp: {
      test: ![0, "0", "false", "FALSE", "False"].includes(
        process.env.EMAIL_TEST_MODE
      ),
      from: process.env.FROM_EMAIL_ADDRESS || "placement@edustaff.local",
      host: process.env.SMTP_HOST || "localhost",
      port: process.env.SMTP_PORT || 1025,
      user: process.env.SMTP_USER || null,
      password: process.env.SMTP_PASSWORD || null,
    },
  },
  jobs: {
    workers: WORKER_CONCURRENCY,
  },
};
