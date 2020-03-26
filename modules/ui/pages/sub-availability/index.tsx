import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { RegularSchedule } from "./components/regular-schedule";
import { Exceptions } from "./components/exceptions";
import { useMyUserAccess } from "reference-data/my-user-access";
import { parseISO } from "date-fns";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useHistory } from "react-router";

export const SubAvailabilityPage: React.FC<{}> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const actualUser = userAccess?.me?.actualUser;
  const history = useHistory();

  const isImpersonating = useIsImpersonating();

  if (!user) {
    return <></>;
  }

  if (isImpersonating && !actualUser?.isSystemAdministrator) {
    history.push("/");
  }

  const userCreatedDate = parseISO(user.createdUtc);

  return (
    <>
      <PageTitle title={t("My Availability")} />
      <RegularSchedule userId={user.id} />
      <Exceptions userId={user.id} userCreatedDate={userCreatedDate} />
    </>
  );
};
