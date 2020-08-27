window.__DEV__ = true;
window.__TEST__ = false;

window.Config = {
  // These are relative because we use a proxy to route the API calls
  restUri: "/",
  apiUri: "/graphql",

  isDevFeatureOnly: true,

  Auth0: {
    domain: "hcmdev.auth0.com",
    clientId: "eLiUtXy2kn7cRvjpl3o7oQGCTlbbxeNS",
    redirectUrl: "http://localhost:3000/",
    apiAudience: "https://hcmdev/api",
    scope: "openid profile email",
    clockSkewLeewaySeconds: 3600,
  },

  // Impersonation header keys
  impersonation: {
    actingUserIdKey: "rrActingUserId",
    actingOrgUserIdKey: "rrActingOrgUserId",
    impersonatingOrgId: "rrImpersonatingOrgId",
  },
};

window.process = {
  env: {
    // ALlow switching on NODE_ENV in client code
    NODE_ENV: "development",
    // Expose Google Analytics ID to client
    TRACKING_ID: "",
    // default value because the git hash can't be generated on the fly in a static file
    CODE_VERSION: "development",
  },
};
