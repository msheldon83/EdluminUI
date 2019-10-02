import * as React from "react";
import { useState, useReducer, useEffect, useContext, Reducer } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

type ExposedAuth0ClientFields = Pick<
  Auth0Client,
  | "loginWithPopup"
  | "loginWithRedirect"
  | "getIdTokenClaims"
  | "handleRedirectCallback"
  | "loginWithRedirect"
  | "getTokenSilently"
  | "getTokenWithPopup"
  | "logout"
>;

type Auth0Context =
  | { loading: true }
  | ({
      loading: false;
      isAuthenticated: boolean;
      user: any;
      popupOpen: boolean;
    } & ExposedAuth0ClientFields);

export const Auth0Context = React.createContext<Auth0Context>({
  loading: true,
});

type Auth0State =
  | {
      client: null;
    }
  | {
      client: Auth0Client;
      isAuthenticated: boolean;
      user: any;
      popupOpen: boolean;
    };

type Auth0Action = {
  type: "initialized";
  client: Auth0Client;
  isAuthenticated: boolean;
  user: any;
};

const authReducer = (state: Auth0State, action: Auth0Action) => {
  switch (action.type) {
    case "initialized": {
      return {
        client: action.client,
        isAuthenticated: action.isAuthenticated,
        user: action.user,
        popupOpen: false,
      };
    }
  }
};

export const useAuth0 = () => useContext(Auth0Context);
export const Auth0Provider: React.FC<
  { onRedirectCallback: () => void } & Auth0ClientOptions
> = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}) => {
  const [state, dispatch] = useReducer<Reducer<Auth0State, Auth0Action>>(
    authReducer,
    {
      client: null,
    }
  );

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client(initOptions);

      // TODO
      // if (window.location.search.includes("code=")) {
      //   const { appState } = await auth0FromHook.handleRedirectCallback();
      //   onRedirectCallback(appState);
      // }

      const isAuthenticated = await auth0FromHook.isAuthenticated();

      let user = null;
      if (isAuthenticated) {
        user = await auth0FromHook.getUser();
      }
      dispatch({
        type: "initialized",
        client: auth0FromHook,
        isAuthenticated,
        user,
      });
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const loginWithPopup = async (params = {}) => {
    console.log("loginWithPopup");
    // setPopupOpen(true);
    // try {
    await state.client!.loginWithPopup(params);
    // } catch (error) {
    //   console.error(error);
    // } finally {
    //   setPopupOpen(false);
    // }
    // const user = await auth0Client.getUser();
    // setUser(user);
    // setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    console.log("handleRedirectCallback");
    // setLoading(true);
    // await auth0Client.handleRedirectCallback();
    // const user = await auth0Client.getUser();
    // setLoading(false);
    // setIsAuthenticated(true);
    // setUser(user);
  };

  let value: Auth0Context = React.useMemo(() => {
    if (state.client) {
      let auth0Client = state.client;
      return {
        loading: false,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        popupOpen: state.popupOpen,
        loginWithPopup: loginWithPopup as any,
        handleRedirectCallback: handleRedirectCallback as any,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p),
      };
    }
    return { loading: true };
  }, [state]);

  return (
    <Auth0Context.Provider value={value}>{children}</Auth0Context.Provider>
  );
};
