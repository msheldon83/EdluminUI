import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { Auth0Context } from "auth/auth0";
import { ProfileUI } from "./profile-ui";

export default {
  title: "Pages/Profile",
};

export const Basic = () => {
  return (
    <ProfileUI
      user={{
        id: 1,
        firstName: "Melanie",
        lastName: "Persons",
        loginEmail: "mpersons@edlumin.com",
        phone: "610-555-1212",
      }}
      updateLoginEmail={(): any => {}}
    />
  );
};
Basic.story = {
  name: "View",
};
