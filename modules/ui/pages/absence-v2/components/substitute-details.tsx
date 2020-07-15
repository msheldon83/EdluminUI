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
import { VacancyDetail } from "ui/components/absence/types";

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
  assignmentsByStartTime?: AssignmentOnDate[] | undefined;
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
    assignmentsByStartTime,
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
    onProjectedVacanciesChange(projectedVacancies);
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
              assignmentsByStartTime
            )
          : []
      );
    }
  }, [getProjectedVacancies.state, projectedVacancies, assignmentsByStartTime]);

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
            vacancySummaryDetails={vacancySummaryDetails}
          />
        )}
      </>
    );
  }, [
    actingAsEmployee,
    locationIds,
    needsReplacementDisplay,
    organizationId,
    vacancySummaryDetails,
    values.needsReplacement,
  ]);

  const isSplitVacancy = React.useMemo(() => {
    const group = groupBy(vacancySummaryDetails, vsd => vsd.assignment?.id);
    return Object.keys(group).length > 1;
  }, [vacancySummaryDetails]);

  const footerActions: JSX.Element = React.useMemo(() => {
    if (vacancySummaryDetails.length === 0) {
      return <></>;
    }

    return (
      <div>
        {" "}
        {/*className={classes.substituteActions} */}
        {!isSplitVacancy && (
          <>
            <FilteredAssignmentButton
              details={vacancySummaryDetails.map(d => {
                return {
                  id: d.vacancyDetailId,
                  date: d.date,
                  startTime: secondsSinceMidnight(
                    d.startTimeLocal.toISOString()
                  ),
                };
              })}
              buttonText={isCreate ? t("Pre-arrange") : t("Assign")}
              disableAssign={false}
              onClick={(detailIds, dates) => {
                const detailsToAssign = vacancySummaryDetails.filter(
                  d =>
                    detailIds.includes(d.vacancyDetailId) ||
                    dates.includes(d.date)
                );
                onAssignSubClick(detailsToAssign);
              }}
            />
            {/* <Can
              do={(
                permissions: OrgUserPermissions[],
                isSysAdmin: boolean,
                orgId?: string,
                forRole?: Role | null | undefined
              ) =>
                canAssignSub(
                  vacancySummaryDetails[0].date,
                  permissions,
                  isSysAdmin,
                  orgId,
                  forRole
                )
              }
            >
              <Button
                variant="outlined"
                className={classes.actionButton}
                onClick={onAssignSubClick}
                // disabled={
                //   props.disableReplacementInteractions ||
                //   props.replacementEmployeeId !== undefined ||
                //   (props.isFormDirty && !!props.arrangeSubButtonTitle)
                // }
              >
                {isCreate ? t("Pre-arrange") : t("Assign Sub")}
              </Button>
            </Can> */}
            {/* {props.replacementEmployeeId !== undefined &&
              props.arrangeSubButtonTitle && (
                <Can
                  do={(
                    permissions: OrgUserPermissions[],
                    isSysAdmin: boolean,
                    orgId?: string,
                    forRole?: Role | null | undefined
                  ) =>
                    canReassignSub(
                      parseISO(vacancies[0].startDate),
                      permissions,
                      isSysAdmin,
                      orgId,
                      forRole
                    )
                  }
                >
                  <Button
                    variant="outlined"
                    className={classes.reassignButton}
                    onClick={() => props.onAssignSubClick()}
                    disabled={props.disableReplacementInteractions}
                  >
                    {t("Reassign Sub")}
                  </Button>
                </Can>
              )} */}
          </>
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
    isCreate,
    isSplitVacancy,
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
          onAssignClick={(currentAssignmentInfo: AssignmentFor) => {
            console.log("currentAssignmentInfo", currentAssignmentInfo);
            // dispatch({
            //   action: "setVacancyDetailIdsToAssign",
            //   vacancyDetailIdsToAssign: currentAssignmentInfo.vacancyDetailIds,
            // });
            // setStep("preAssignSub");
            //onAssignSubClick(currentAssignmentInfo)
          }}
          onCancelAssignment={onCancelAssignment}
          notesForSubstitute={values.notesToReplacement}
          setNotesForSubstitute={(notes: string) => {
            setFieldValue("notesToReplacement", notes);
          }}
          showPayCodes={true}
          showAccountingCodes={true}
          isAbsence={true}
          noDaysChosenText={t("Select Date(s), Reason, and Times...")}
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
