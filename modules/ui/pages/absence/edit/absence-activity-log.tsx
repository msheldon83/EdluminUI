import { makeStyles } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { GetActivityLogForAbsence } from "../graphql/get-activity-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceActivityLogRoute } from "ui/routes/absence-vacancy/activity-log";
import { AdminEditAbsenceRoute } from "ui/routes/absence";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { GetAbsence } from "../graphql/get-absence.gen";
import { ActivityLog } from "ui/components/activity-log/activity-log";
import { compact } from "lodash-es";
import { EmployeeLink } from "ui/components/links/people";

export const AbsenceActivityLog: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(AbsenceActivityLogRoute);
  const history = useHistory();

  const getActivityLog = useQueryBundle(GetActivityLogForAbsence, {
    variables: { id: params.absenceId },
  });

  const getAbsence = useQueryBundle(GetAbsence, {
    variables: { id: params.absenceId },
  });
  const absence =
    getAbsence.state !== "LOADING" ? getAbsence?.data?.absence?.byId : null;
  const employeeName = `${absence?.employee?.firstName ?? ""} ${absence
    ?.employee?.lastName ?? ""}`;

  const onReturn = () => {
    history.push(
      AdminEditAbsenceRoute.generate({
        absenceId: params.absenceId,
        organizationId: params.organizationId,
      })
    );
  };

  if (getActivityLog.state === "LOADING") {
    return <></>;
  }

  const logDetails = compact(
    getActivityLog?.data?.absence?.activityLog?.activityLogDetails ?? []
  );

  const subHeader = absence?.employee?.id ? (
    <EmployeeLink orgUserId={absence?.employee?.id} color="black">
      {employeeName}
    </EmployeeLink>
  ) : (
    employeeName
  );

  return (
    <>
      <AbsenceVacancyHeader
        subHeader={subHeader}
        pageHeader={`${t("Activity log")} #${params.absenceId}`}
        onCancel={onReturn}
      />
      <ActivityLog logDetails={logDetails} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
  infoText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));
