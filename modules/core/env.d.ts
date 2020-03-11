/*
These come from Webpack's DefinePlugin (and from Jest globals for test)
*/
declare const __DEV__: boolean;
declare const __TEST__: boolean;

declare const Config: {
  Auth0: {
    domain: string;
    clientId: string;
    redirectUrl: string;
    apiAudience: string;
    scope: string;
    clockSkewLeewaySeconds: number;
  };
  apiUri: string;
  isDevFeatureOnly: boolean;
  impersonation: {
    actingUserIdKey: string;
    actingOrgUserIdKey: string;
  };
};
