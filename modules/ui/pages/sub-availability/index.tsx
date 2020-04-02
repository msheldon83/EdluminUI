import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { RegularSchedule } from "./components/regular-schedule";
import { Exceptions } from "./components/exceptions";
import { useMyUserAccess } from "reference-data/my-user-access";
import { parseISO } from "date-fns";
import { useIsImpersonating } from "reference-data/is-impersonating";

export const SubAvailabilityPage: React.FC<{}> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const actualUser = userAccess?.me?.actualUser;

  const isImpersonating = useIsImpersonating();
  const regularAdminImpersonating =
    isImpersonating && !actualUser?.isSystemAdministrator;

  if (!user) {
    return <></>;
  }

  const userCreatedDate = parseISO(user.createdUtc);

  return (
    <>
      <PageTitle title={t("My Availability")} />
      <RegularSchedule
        userId={user.id}
        isImpersonating={regularAdminImpersonating}
      />
      <Exceptions
        userId={user.id}
        userCreatedDate={userCreatedDate}
        isImpersonating={regularAdminImpersonating}
      />
    </>
  );
};
