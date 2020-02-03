import * as React from "react";
import { ProfileUI } from "./profile-ui";
import { mockProvider } from "test-helpers/mock-provider";
import { TimeZone, UserAccess } from "graphql/server-types.gen";

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
          orgUsers: [],
          createdUtc: "1/1/2019 08:00AM",
        }}
        updateLoginEmail={(): any => {}}
        resetPassword={(): any => {}}
        updateUser={(): any => {}}
        timeZoneOptions={[
          {
            enumValue: "EASTERN_STANDARD_TIME_US_CANADA" as TimeZone,
            name: "US Eastern Standard Time",
          },
          {
            enumValue: "CENTRAL_STANDARD_TIME_US_CANADA" as TimeZone,
            name: "Central Standard Time",
          },
        ]}
      />
    </Provider>
  );
};
Basic.story = {
  name: "View",
};
