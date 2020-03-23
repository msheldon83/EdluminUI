import * as React from "react";
import { ProfileUI } from "./profile-ui";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Pages/Profile",
};

export const Basic = () => {
  const Provider = mockProvider();
  return (
    <Provider>
      <ProfileUI
        user={{
          id: "1",
          rowVersion: "1",
          firstName: "Melanie",
          lastName: "Persons",
          loginEmail: "mpersons@edlumin.com",
          phone: "610-555-1212",
          timeZoneId: "EASTERN_STANDARD_TIME_US_CANADA" as any,
        }}
        onUpdateLoginEmail={(): any => {}}
        onResetPassword={(): any => {}}
        onUpdateUser={(): any => {}}
      />
    </Provider>
  );
};
Basic.story = {
  name: "View",
};
