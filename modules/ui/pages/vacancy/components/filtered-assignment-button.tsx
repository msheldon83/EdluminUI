import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@material-ui/core";
import { Can } from "ui/components/auth/can";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { canAssignSub } from "helpers/permissions";
import { VacancyDetailsFormData, VacancyDetailItem } from "../helpers/types";
import { endOfTomorrow, min, setSeconds, isFuture } from "date-fns";
import { VacancyActions } from "ui/pages/vacancy/state";
import { VacancyStep } from "helpers/step-params";

type Props = {
  vacancy: VacancyDetailsFormData;
  vacancyExists: boolean;
  dirty: boolean;
  disableAssign: boolean;
  isSubmitting: boolean;
  dispatch: React.Dispatch<VacancyActions>;
  setStep: (newT: VacancyStep) => void;
};

export const FilteredAssignmentButton: React.FC<Props> = ({
  vacancy,
  vacancyExists,
  dirty,
  disableAssign,
  isSubmitting,
  dispatch,
  setStep,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const futureDetails = vacancy.details.filter(d =>
    isFuture(setSeconds(d.date, d.startTime))
  );

  const allDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    canAssignSub(
      vacancy.details.reduce(
        (acc, detail) => min([acc, setSeconds(detail.date, detail.startTime)]),
        endOfTomorrow()
      ),
      permissions,
      isSysAdmin,
      orgId,
      forRole
    );

  const futureDetailPerms = (
    permissions: OrgUserPermissions[],
    isSysAdmin: boolean,
    orgId?: string,
    forRole?: Role | null | undefined
  ) =>
    futureDetails.length > 0 &&
    canAssignSub(
      setSeconds(futureDetails[0].date, futureDetails[0].startTime),
      permissions,
      isSysAdmin,
      orgId,
      forRole
    );

  const PreArrangeButton: React.FC<{ details: VacancyDetailItem[] }> = ({
    details,
  }) => (
    <Button
      variant="outlined"
      disabled={vacancyExists ? dirty : disableAssign || isSubmitting}
      className={classes.preArrangeButton}
      onClick={() => {
        dispatch({
          action: "setVacancyDetailIdsToAssign",
          vacancyDetailIdsToAssign: details.map(d => d.id ?? ""),
        });
        setStep("preAssignSub");
      }}
    >
      {!vacancyExists ? t("Pre-arrange") : t("Assign")}
    </Button>
  );

  return (
    <>
      <Can do={allDetailPerms}>
        <PreArrangeButton details={vacancy.details} />
      </Can>
      <Can not do={allDetailPerms}>
        <Can do={futureDetailPerms}>
          <PreArrangeButton details={futureDetails} />
        </Can>
      </Can>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  preArrangeButton: {
    marginRight: theme.spacing(2),
  },
}));
