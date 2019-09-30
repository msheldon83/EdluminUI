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

module.exports = {
  databaseUrl: envVarOrBust(
    process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
  ),
  server: {
    requireSsl: false,
    enableDeveloperLogin: true,
    secret: "cat",
    graphiql: true,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER,
    smtp: {
      test: false,
    },
    jobAwardDelaySeconds: 15,
  },
  auth: {
    idpPublicCert: "MIIDPDCCAiQCCQDydJgOlszqbzANBgkqhkiG9w0BAQUFADBgMQswCQYDVQQGEwJV UzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEQ MA4GA1UEChMHSmFua3lDbzESMBAGA1UEAxMJbG9jYWxob3N0MB4XDTE0MDMxMjE5 NDYzM1oXDTI3MTExOTE5NDYzM1owYDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNh bGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28xEDAOBgNVBAoTB0phbmt5 Q28xEjAQBgNVBAMTCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC AQoCggEBAMGvJpRTTasRUSPqcbqCG+ZnTAurnu0vVpIG9lzExnh11o/BGmzu7lB+ yLHcEdwrKBBmpepDBPCYxpVajvuEhZdKFx/Fdy6j5mH3rrW0Bh/zd36CoUNjbbhH yTjeM7FN2yF3u9lcyubuvOzr3B3gX66IwJlU46+wzcQVhSOlMk2tXR+fIKQExFrO uK9tbX3JIBUqItpI+HnAow509CnM134svw8PTFLkR6/CcMqnDfDK1m993PyoC1Y+ N4X9XkhSmEQoAlAHPI5LHrvuujM13nvtoVYvKYoj7ScgumkpWNEvX652LfXOnKYl kB8ZybuxmFfIkzedQrbJsyOhfL03cMECAwEAATANBgkqhkiG9w0BAQUFAAOCAQEA eHwzqwnzGEkxjzSD47imXaTqtYyETZow7XwBc0ZaFS50qRFJUgKTAmKS1xQBP/qH pStsROT35DUxJAE6NY1Kbq3ZbCuhGoSlY0L7VzVT5tpu4EY8+Dq/u2EjRmmhoL7U kskvIZ2n1DdERtd+YUMTeqYl9co43csZwDno/IKomeN5qaPc39IZjikJ+nUC6kPF Keu/3j9rgHNlRtocI6S1FdtFz9OZMQlpr0JbUt2T3xS/YoQJn6coDmJL5GTiiKM6 cOe+Ur1VwzS1JEDbSS2TWWhzq8ojLdrotYLGd9JOsoQhElmz+tMfCFQUFLExinPA yy7YHlSiVX13QH2XTu/iQQ==",
    identityProviderHostLogin: "https://edustaff-idp-staging.herokuapp.com/",
    identityProviderHostLogout: "https://edustaff-idp-staging.herokuapp.com/saml/slo",
  },
};