import * as React from "react";
import {
  makeStyles,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import {
  AssignmentFor,
  VacancySummaryDetail,
} from "ui/components/absence-vacancy/vacancy-summary/types";
import { AbsenceFormData, AssignmentOnDate } from "../types";
import { useFormikContext } from "formik";
import {
  AbsenceCreateInput,
  Vacancy,
  NeedsReplacement,
  PermissionEnum,
} from "graphql/server-types.gen";
import { GetProjectedVacancies } from "../graphql/get-projected-vacancies.gen";
import { useQueryBundle } from "graphql/hooks";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { compact, groupBy } from "lodash-es";
import { convertVacancyToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { SubstituteDetailsCodes } from "./substitute-details-codes";
import { Can } from "ui/components/auth/can";
import { DesktopOnly, MobileOnly } from "ui/components/mobile-helpers";
import { FilteredAssignmentButton } from "ui/components/absence-vacancy/filtered-assignment-button";
import { secondsSinceMidnight } from "helpers/time";
import { isSameDay } from "date-fns";
import {
  accountingCodeAllocationsAreTheSame,
  mapAccountingCodeAllocationsToAccountingCodeValue,
  accountingCodeValuesAreEqual,
} from "helpers/accounting-code-allocations";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";

type Props = {
  isCreate: boolean;
  organizationId: string;
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  locationIds?: string[];
  absenceInput: AbsenceCreateInput | null;
  onAssignSubClick: (
    vacancySummaryDetailsToAssign: VacancySummaryDetail[]
  ) => void;
  onCancelAssignment: (vacancyDetailIds: string[]) => Promise<void>;
  onEditSubDetailsClick: () => void;
  onProjectedVacanciesChange: (vacancies: Vacancy[]) => void;
  onOverallCodeChanges: (details: {
    accountingCodeValue?: AccountingCodeValue;
    payCodeId?: string | null;
  }) => void;
  assignmentsByDate?: AssignmentOnDate[] | undefined;
};

export const SubstituteDetails: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    isCreate,
    organizationId,
    actingAsEmployee,
    needsReplacement,
    absenceInput,
    onAssignSubClick,
    onCancelAssignment,
    onEditSubDetailsClick,
    locationIds,
    onProjectedVacanciesChange,
    onOverallCodeChanges,
    assignmentsByDate,
  } = props;
  const { values, setFieldValue } = useFormikContext<AbsenceFormData>();
  const snackbar = useSnackbar();

  const getProjectedVacancies = useQueryBundle(GetProjectedVacancies, {
    variables: {
      absence: {
        ...absenceInput!,
        ignoreWarnings: true,
      },
    },
    skip: !absenceInput,
    fetchPolicy: "network-only",
    onError: error => {
      ShowErrors(error, snackbar.openSnackbar);
    },
  });

  const projectedVacancies = React.useMemo(
    () => {
      const result =
        getProjectedVacancies.state === "LOADING" ||
        getProjectedVacancies.state === "UPDATING" ||
        getProjectedVacancies.state === "ERROR"
          ? []
          : (compact(
              getProjectedVacancies.data?.absence?.projectedVacancies ?? []
            ) as Vacancy[]);
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getProjectedVacancies.state]
  );

  React.useEffect(() => {
    if (projectedVacancies.length > 0) {
      onProjectedVacanciesChange(projectedVacancies);
    }
  }, [onProjectedVacanciesChange, projectedVacancies]);

  // Prevent flashes of loading in the Vacancy Summary component by keeping the
  // vacancySummaryDetails in state and only updating them when getProjectedVacancies
  // request has finished loading
  const [vacancySummaryDetails, setVacancySummaryDetails] = React.useState<
    VacancySummaryDetail[]
  >([]);
  React.useEffect(() => {
    if (
      getProjectedVacancies.state !== "LOADING" &&
      getProjectedVacancies.state !== "UPDATING"
    ) {
      setVacancySummaryDetails(
        projectedVacancies[0]
          ? convertVacancyToVacancySummaryDetails(
              projectedVacancies[0],
              assignmentsByDate
            )
          : []
      );
    }
  }, [getProjectedVacancies.state, projectedVacancies, assignmentsByDate]);

  const detailsHaveDifferentAccountingCodes = React.useMemo(() => {
    const codesAreTheSame = accountingCodeAllocationsAreTheSame(
      vacancySummaryDetails[0]?.accountingCodeAllocations ?? [],
      vacancySummaryDetails?.map(vsd => vsd.accountingCodeAllocations)
    );
    return !codesAreTheSame;
  }, [vacancySummaryDetails]);

  const detailsHaveDifferentPayCodes = React.useMemo(() => {
    const payCodeIdToCompare = vacancySummaryDetails[0]?.payCodeId;

    for (let i = 0; i < vacancySummaryDetails.length; i++) {
      const d = vacancySummaryDetails[i];
      const detailPayCodeId = d?.payCodeId ?? null;

      if (!detailPayCodeId && !payCodeIdToCompare) {
        // Both values are falsy so they are the same
        continue;
      }

      if (detailPayCodeId !== payCodeIdToCompare) {
        return true;
      }
    }

    return false;
  }, [vacancySummaryDetails]);

  // Keep the accounting code allocations and pay code selections
  // on the Absence view in sync with changes potentially happening
  // via the Edit Sub Details view. No dependencies on values.accountingCodeAllocations
  // or values.payCodeId, because we only really want this to fire when the details
  // are updated and when they no longer have different selections
  React.useEffect(() => {
    if (vacancySummaryDetails.length === 0) {
      return;
    }

    if (!detailsHaveDifferentAccountingCodes) {
      const newAccountingCodeValue = mapAccountingCodeAllocationsToAccountingCodeValue(
        vacancySummaryDetails[0].accountingCodeAllocations
      );
      if (
        !accountingCodeValuesAreEqual(
          values.accountingCodeAllocations,
          newAccountingCodeValue
        )
      ) {
        setFieldValue("accountingCodeAllocations", newAccountingCodeValue);
      }
    }

    if (
      !detailsHaveDifferentPayCodes &&
      values.payCodeId !== vacancySummaryDetails[0].payCodeId
    ) {
      setFieldValue("payCodeId", vacancySummaryDetails[0].payCodeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    detailsHaveDifferentAccountingCodes,
    detailsHaveDifferentPayCodes,
    vacancySummaryDetails,
  ]);

  const needsReplacementDisplay: JSX.Element = React.useMemo(() => {
    return (
      <>
        {!actingAsEmployee ||
        needsReplacement === NeedsReplacement.Sometimes ? (
          <FormControlLabel
            label={t("Requires a substitute")}
            control={
              <Checkbox
                checked={values.needsReplacement}
                onChange={e =>
                  setFieldValue("needsReplacement", e.target.checked)
                }
                color="primary"
              />
            }
          />
        ) : (
          <Typography className={classes.substituteRequiredText}>
            {needsReplacement === NeedsReplacement.Yes
              ? t("Requires a substitute")
              : t("No substitute required")}
          </Typography>
        )}
      </>
    );
  }, [
    actingAsEmployee,
    classes.substituteRequiredText,
    needsReplacement,
    setFieldValue,
    t,
    values.needsReplacement,
  ]);

  const absenceActions: JSX.Element = React.useMemo(() => {
    return (
      <>
        {needsReplacementDisplay}
        {values.needsReplacement && (
          <SubstituteDetailsCodes
            organizationId={organizationId}
            actingAsEmployee={actingAsEmployee}
            locationIds={locationIds}
            detailsHaveDifferentAccountingCodes={
              detailsHaveDifferentAccountingCodes
            }
            detailsHaveDifferentPayCodes={detailsHaveDifferentPayCodes}
            onOverallCodeChanges={onOverallCodeChanges}
          />
        )}
      </>
    );
  }, [
    actingAsEmployee,
    detailsHaveDifferentAccountingCodes,
    detailsHaveDifferentPayCodes,
    locationIds,
    needsReplacementDisplay,
    onOverallCodeChanges,
    organizationId,
    values.needsReplacement,
  ]);

  const footerActions: JSX.Element = React.useMemo(() => {
    if (vacancySummaryDetails.length === 0) {
      return <></>;
    }

    const hasAssignments = assignmentsByDate && assignmentsByDate.length > 0;

    return (
      <div>
        {!hasAssignments && (
          <FilteredAssignmentButton
            details={vacancySummaryDetails.map(d => {
              return {
                id: d.vacancyDetailId,
                date: d.date,
                startTime: secondsSinceMidnight(d.startTimeLocal.toISOString()),
              };
            })}
            buttonText={isCreate ? t("Pre-arrange") : t("Assign")}
            disableAssign={false}
            onClick={(detailIds, dates) => {
              const detailsToAssign = vacancySummaryDetails.filter(
                d =>
                  detailIds.includes(d.vacancyDetailId) ||
                  dates.find(date => isSameDay(date, d.date))
              );
              onAssignSubClick(detailsToAssign);
            }}
          />
        )}
        <Can do={[PermissionEnum.AbsVacSave]}>
          <Button
            variant="outlined"
            onClick={onEditSubDetailsClick}
            //disabled={props.disableEditingDatesAndTimes}
          >
            <DesktopOnly>{t("Edit Substitute Details")}</DesktopOnly>
            <MobileOnly>{t("Edit Details")}</MobileOnly>
          </Button>
        </Can>
      </div>
    );
  }, [
    assignmentsByDate,
    isCreate,
    onAssignSubClick,
    onEditSubDetailsClick,
    t,
    vacancySummaryDetails,
  ]);

  return (
    <>
      <div className={classes.substituteDetailsHeader}>
        <Typography className={classes.substituteDetailsTitle} variant="h5">
          {t("Substitute Details")}
        </Typography>
        <Typography className={classes.subText}>
          {t(
            "These times may not match your schedule exactly depending on district configuration."
          )}
        </Typography>
      </div>
      {values.needsReplacement && (
        <VacancySummary
          vacancySummaryDetails={vacancySummaryDetails}
          onAssignClick={(currentAssignmentInfo: AssignmentFor) =>
            onAssignSubClick(currentAssignmentInfo.vacancySummaryDetails)
          }
          onCancelAssignment={onCancelAssignment}
          notesForSubstitute={values.notesToReplacement}
          setNotesForSubstitute={(notes: string) => {
            setFieldValue("notesToReplacement", notes);
          }}
          showPayCodes={
            detailsHaveDifferentAccountingCodes || detailsHaveDifferentPayCodes
          }
          showAccountingCodes={
            detailsHaveDifferentAccountingCodes || detailsHaveDifferentPayCodes
          }
          noDaysChosenText={t("Select a Date, Reason, and Times...")}
          isAbsence={true}
          absenceActions={absenceActions}
          footerActions={footerActions}
        />
      )}
      {!values.needsReplacement && (
        <div className={classes.noReplacementNeeded}>
          {needsReplacementDisplay}
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  substituteDetailsHeader: {
    marginBottom: theme.spacing(2),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  substituteRequiredText: {
    fontStyle: "italic",
  },
  noReplacementNeeded: {
    width: "100%",
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    padding: theme.spacing(2),
  },
  actionButton: {
    marginRight: theme.spacing(2),
  },

  substituteDetailsTitle: { paddingBottom: theme.typography.pxToRem(3) },
  substituteDetailsSubtitle: { paddingBottom: theme.typography.pxToRem(1) },
  subDetailsContainer: {
    marginTop: theme.spacing(2),
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderRadius: theme.typography.pxToRem(4),
  },
  notesSection: {
    paddingTop: theme.spacing(3),
  },
  usageTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: `${theme.spacing(2)}px 0`,
  },
  usageText: {
    marginLeft: theme.spacing(1),
  },
  dayPartIcon: {
    height: theme.spacing(3),
  },
  monthSwitcher: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closedDayBanner: {
    marginTop: theme.typography.pxToRem(5),
    backgroundColor: theme.customColors.yellow1,
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(4),
  },
}));
