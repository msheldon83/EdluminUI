import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Formik } from "formik";
import clsx from "clsx";
import * as yup from "yup";
import { format } from "date-fns";
import {
  AbsenceReasonTrackingTypeId,
  PermissionEnum,
  VacancyDetailVerifyInput,
} from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { useHistory, useLocation } from "react-router";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Can } from "ui/components/auth/can";
import { getPayLabel } from "ui/components/helpers";
import { useOrgVacancyDayConversions } from "reference-data/org-vacancy-day-conversions";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { usePayCodes } from "reference-data/pay-codes";
import { AssignmentDetail } from "./types";
import { ProgressBar } from "./components/progess-bar";
import { Assignment } from "./components/assignment";
import { PartyPopper } from "./components/party-popper";
import { VerifiedDailyFooter } from "./components/verified-daily-footer";

type Props = {
  date: Date;
  assignments: AssignmentDetail[];
  onVerify: (verifyInput: VacancyDetailVerifyInput) => Promise<void>;
  orgId: string;
  showVerified: boolean;
  width?: number;
  height?: number;
};

export const VerifyDailyUI: React.FC<Props> = ({
  date,
  assignments,
  onVerify,
  orgId,
  showVerified,
  width,
  height,
}) => {
  const { t } = useTranslation();
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const vacancyEditParams = useRouteParams(VacancyViewRoute);
  const [selectedAssignment, setSelectedAssignment] = React.useState<
    string | undefined
  >();
  const [nextSelectedAssignment, setNextSelectedAssignment] = React.useState<
    string | undefined
  >();
  // When we select a detail record figure out what the next record we should have selected once we verify
  const onSelectDetail = (vacancyDetailId: string) => {
    setSelectedAssignment(vacancyDetailId);
    const index = assignments.findIndex(x => x.id === vacancyDetailId);
    const nextId = assignments[index + 1]?.id;
    const previousId = assignments[index - 1]?.id;
    if (nextId) {
      setNextSelectedAssignment(nextId);
    } else if (previousId) {
      setNextSelectedAssignment(previousId);
    } else {
      setNextSelectedAssignment(undefined);
    }
  };
  const payCodes = usePayCodes(orgId);
  const payCodeOptions = React.useMemo(
    () => payCodes.map(c => ({ label: c.name, value: c.id })),
    [payCodes]
  );
  const vacancyDayConversions = useOrgVacancyDayConversions(orgId);
  const history = useHistory();
  const goToEdit = (vacancyId: string, absenceId?: string | null) => {
    if (absenceId) {
      const url = AdminEditAbsenceRoute.generate({
        ...absenceEditParams,
        absenceId,
      });
      history.push(url);
    } else {
      const url = VacancyViewRoute.generate({
        ...vacancyEditParams,
        vacancyId,
      });
      history.push(url);
    }
  };
  const unverified = assignments.filter(a => !a.verifiedAtLocal);

  return (
    <>
      <Grid container justify="space-between">
        <Grid item>
          <Typography variant="h5">{`${assignments.length -
            unverified.length} ${t("verified assignments")}`}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5">{`${unverified.length} ${t(
            "awaiting verification"
          )}`}</Typography>
        </Grid>
      </Grid>
      <ProgressBar
        thick
        verifiedAssignments={assignments.length - unverified.length}
        totalAssignments={assignments.length}
      />
      {assignments.length > 0 && unverified.length == 0 && (
        <PartyPopper width={width} height={height}>
          <VerifiedDailyFooter orgId={orgId} />
        </PartyPopper>
      )}
      <Grid container direction="column">
        {(showVerified ? assignments : unverified).map((a, i) => (
          <Assignment
            key={a.id}
            vacancyDetail={a}
            shadeRow={i % 2 != 0}
            onVerify={onVerify}
            selectedVacancyDetail={selectedAssignment}
            onSelectDetail={onSelectDetail}
            payCodeOptions={payCodeOptions}
            vacancyDayConversions={vacancyDayConversions}
            goToEdit={goToEdit}
          />
        ))}
      </Grid>
    </>
  );
};
