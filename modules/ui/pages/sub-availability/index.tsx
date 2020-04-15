import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { RegularSchedule } from "./components/regular-schedule";
import { Exceptions } from "./components/exceptions";
import { useMyUserAccess } from "reference-data/my-user-access";
import { parseISO, isValid } from "date-fns";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useQueryParams } from "hooks/query-params";

export const SubAvailabilityPage: React.FC<{}> = props => {
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const user = userAccess?.me?.user;
  const actualUser = userAccess?.me?.actualUser;
  const [params, _] = useQueryParams({fromDate: "", toDate: ""});

  const isImpersonating = useIsImpersonating();
  const regularAdminImpersonating =
    isImpersonating && !actualUser?.isSystemAdministrator;

  if (!user) {
    return <></>;
  }

  const userCreatedDate = parseISO(user.createdUtc);
  const fromDate = parseISO(params.fromDate);
  const toDate = parseISO(params.toDate);

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
        fromDate={isValid(fromDate) ? fromDate : undefined}
        toDate={isValid(toDate) ? toDate : undefined}
      />
    </>
  );
};
