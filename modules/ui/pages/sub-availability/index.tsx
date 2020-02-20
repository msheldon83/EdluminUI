import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { RegularSchedule } from "./components/regular-schedule";
import { Exceptions } from "./components/exceptions";
import { useMyUserAccess } from "reference-data/my-user-access";
import { parseISO } from "date-fns";

export const SubAvailabilityPage: React.FC<{}> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;

  if (!user) {
    return <></>;
  }

  const userCreatedDate = useMemo(() => parseISO(user.createdUtc), [user]);

  return (
    <>
      <PageTitle title={t("My Availability")} />
      <RegularSchedule userId={user.id} />
      <Exceptions userId={user.id} userCreatedDate={userCreatedDate} />
    </>
  );
};
