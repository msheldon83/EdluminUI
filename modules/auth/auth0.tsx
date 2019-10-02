import * as React from "react";
import { useState, useReducer, useEffect, useContext, Reducer } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

type Auth0State =
  | {
      loading: true;
    }
  | {
      loading: false;
      client: Auth0Client;
      isAuthenticated: boolean;
      token: any;
      user: any;
      popupOpen: boolean;
    };

type Auth0Action = {
  type: "initialized";
  client: Auth0Client;
  isAuthenticated: boolean;
  user: any;
  token: any;
};

export const Auth0Context = React.createContext<Auth0State>({
  loading: true,
});

const authReducer: Reducer<Auth0State, Auth0Action> = (state, action) => {
  switch (action.type) {
    case "initialized": {
      return {
        loading: false,
        client: action.client,
        isAuthenticated: action.isAuthenticated,
        user: action.user,
        token: action.token,
        popupOpen: false,
      };
    }
  }
};

export const useAuth0 = () => useContext(Auth0Context);
export const Auth0Provider: React.FC<
  { onRedirectCallback: (state: any) => any } & Auth0ClientOptions
> = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}) => {
  const [state, dispatch] = useReducer<Reducer<Auth0State, Auth0Action>>(
    authReducer,
    { loading: true }
  );

  useEffect(() => {
    const initAuth0 = async () => {
      const client = await createAuth0Client(initOptions);

      // TODO
      if (window.location.search.includes("code=")) {
        const { appState } = await client.handleRedirectCallback();
        setTimeout(() => onRedirectCallback(appState));
      }

      const isAuthenticated = await client.isAuthenticated();
      const token = await client.getTokenSilently();

      let user = null;
      if (isAuthenticated) {
        user = await client.getUser();
      }
      dispatch({
        type: "initialized",
        client,
        isAuthenticated,
        user,
        token,
      });
    };
    initAuth0(); // eslint-disable-line
    // eslint-disable-next-line
  }, []);

  return (
    <Auth0Context.Provider value={state}>{children}</Auth0Context.Provider>
  );
};
