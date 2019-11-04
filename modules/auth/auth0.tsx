import * as React from "react";
import {
  useState,
  useCallback,
  useReducer,
  useEffect,
  useContext,
  Reducer,
} from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";
import { History } from "history";

export type Auth0Context = {
  isAuthenticated: boolean;
  getToken: () => Promise<string>;
  login: () => void;
  logout: () => void;
};
const Empty: Auth0Context = {
  isAuthenticated: false,
  getToken: async () => {
    throw Error("no");
  },
  login: () => {},
  logout: () => {},
};
export const Auth0Context = React.createContext<Auth0Context>(Empty);
export const useAuth0 = () => useContext(Auth0Context);
const AFTER_AUTH_REDIRECT_URL = "AFTER_AUTH_REDIRECT_URL";

type Auth0State =
  | {
      loading: true;
    }
  | {
      loading: false;
      client: Auth0Client;
      isAuthenticated: boolean;
      claims?: IdToken;
      user: any;
    };

type Auth0Action = {
  type: "initialized";
  client: Auth0Client;
  isAuthenticated: boolean;
  user: any;
  claims?: IdToken;
};

const authReducer: Reducer<Auth0State, Auth0Action> = (state, action) => {
  switch (action.type) {
    case "initialized": {
      return {
        loading: false,
        client: action.client,
        isAuthenticated: action.isAuthenticated,
        user: action.user,
        claims: action.claims,
      };
    }
  }
};

type Props = {
  history: History<any>;
};
export const Auth0Provider: React.FC<Props> = ({ children, history }) => {
  const [state, dispatch] = useReducer<
    Reducer<Auth0State, Auth0Action>
  >(authReducer, { loading: true });

  useEffect(() => {
    const initAuth0 = async () => {
      const client = await createAuth0Client({
        domain: Config.Auth0.domain,
        scope: Config.Auth0.scope,
        audience: Config.Auth0.apiAudience,
        client_id: Config.Auth0.clientId,
        redirect_uri: Config.Auth0.redirectUrl,
      });
      if (history.location.search.includes("code=")) {
        await client.handleRedirectCallback();

        const afterAuthRedirectUrl = sessionStorage.getItem(
          AFTER_AUTH_REDIRECT_URL
        );
        sessionStorage.removeItem(AFTER_AUTH_REDIRECT_URL);
        history.replace(afterAuthRedirectUrl || "/");
      }

      const isAuthenticated = await client.isAuthenticated();

      let user = null;
      if (isAuthenticated) {
        user = await client.getUser();
      }
      let claims: IdToken | undefined;
      if (isAuthenticated) {
        claims = await client.getIdTokenClaims();
      }

      dispatch({
        type: "initialized",
        client,
        isAuthenticated,
        user,
        claims,
      });
    };
    initAuth0(); // eslint-disable-line
    // eslint-disable-next-line
  }, []);

  const isAuthenticated = !state.loading && state.isAuthenticated;
  const identity = !state.loading && state.user && state.user.email;

  const getToken = useCallback(
    async () => {
      if (state.loading) throw Error("still loading");
      return await state.client.getTokenSilently({
        scope: Config.Auth0.scope,
        audience: Config.Auth0.apiAudience,
      });
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      isAuthenticated,
      identity,
    ]
  );

  const login = useCallback(
    () => {
      if (!state.loading) {
        const { pathname, search, hash } = history.location;
        sessionStorage.setItem(
          AFTER_AUTH_REDIRECT_URL,
          `${pathname}${search}${hash}`
        );
        return state.client.loginWithRedirect({
          audience: Config.Auth0.apiAudience,
          redirect_uri: Config.Auth0.redirectUrl,
          scope: Config.Auth0.scope,
        });
      }
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      isAuthenticated,
      identity,
    ]
  );

  const logout = useCallback(
    () => {
      if (!state.loading) {
        return state.client.logout();
      }
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      isAuthenticated,
      identity,
    ]
  );

  const context: Auth0Context = React.useMemo(
    () => ({
      isAuthenticated,
      getToken,
      login,
      logout,
    }),
    [isAuthenticated, getToken, login, logout]
  );

  if (state.loading) return <></>;
  return (
    <Auth0Context.Provider value={context}>{children}</Auth0Context.Provider>
  );
};
