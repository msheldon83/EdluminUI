import { makeStyles } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { GetActivityLogForVacancy } from "./graphql/get-activity-log.gen";
import { useRouteParams } from "ui/routes/definition";
import { VacancyActivityLogRoute } from "ui/routes/absence-vacancy/activity-log";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { GetVacancyById } from "./graphql/get-vacancy-byid.gen";
import { ActivityLog } from "ui/components/activity-log/activity-log";
import { compact } from "lodash-es";

export const VacancyActivityLog: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(VacancyActivityLogRoute);
  const history = useHistory();

  const getActivityLog = useQueryBundle(GetActivityLogForVacancy, {
    variables: { id: params.vacancyId },
  });

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: { id: params.vacancyId },
  });
  const vacancy =
    getVacancy.state !== "LOADING" ? getVacancy?.data?.vacancy?.byId : null;
  const positionTitle = vacancy?.position?.title ?? "";

  const onReturn = () => {
    history.push(VacancyViewRoute.generate(params));
  };

  if (getActivityLog.state === "LOADING") {
    return <></>;
  }

  const logDetails = compact(
    getActivityLog?.data?.vacancy?.activityLog?.activityLogDetails ?? []
  );

  return (
    <>
      <AbsenceVacancyHeader
        orgId={params.organizationId}
        actingAsEmployee={false}
        subHeader={positionTitle}
        pageHeader={`${t("Activity log")} #V${params.vacancyId}`}
        onCancel={onReturn}
        isForVacancy={true}
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
