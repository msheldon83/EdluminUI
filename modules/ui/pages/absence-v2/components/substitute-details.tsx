import * as React from "react";
import {
  makeStyles,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { VacancySummary } from "ui/components/absence-vacancy/vacancy-summary";
import {
  AssignmentFor,
  VacancySummaryDetail,
} from "ui/components/absence-vacancy/vacancy-summary/types";
import { AbsenceFormData } from "../types";
import { useFormikContext } from "formik";
import {
  AbsenceCreateInput,
  Vacancy,
  NeedsReplacement,
} from "graphql/server-types.gen";
import { GetProjectedVacancies } from "../graphql/get-projected-vacancies.gen";
import { useQueryBundle } from "graphql/hooks";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { compact } from "lodash-es";
import { parseISO } from "date-fns";
import { convertVacancyToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";
import { SubstituteDetailsCodes } from "./substitute-details-codes";

type Props = {
  organizationId: string;
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  locationIds?: string[];
  absenceInput: AbsenceCreateInput | null;
  onPreArrangeClick: () => void;
  onEditSubDetailsClick: () => void;
};

export const SubstituteDetails: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    organizationId,
    actingAsEmployee,
    needsReplacement,
    absenceInput,
    onPreArrangeClick,
    onEditSubDetailsClick,
    locationIds,
  } = props;
  const { values, errors, setFieldValue } = useFormikContext<AbsenceFormData>();
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

  const vacancySummaryDetails: VacancySummaryDetail[] = React.useMemo(() => {
    if (!projectedVacancies || projectedVacancies.length < 1) {
      return [];
    }

    const vacancy = projectedVacancies[0];
    return convertVacancyToVacancySummaryDetails(vacancy);
  }, [projectedVacancies]);

  const absenceActions: JSX.Element = (
    <>
      {!actingAsEmployee || needsReplacement === NeedsReplacement.Sometimes ? (
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
        <Typography>
          {" "}
          {/*className={classes.substituteRequiredText}*/}
          {needsReplacement === NeedsReplacement.Yes
            ? t("Requires a substitute")
            : t("No substitute required")}
        </Typography>
      )}
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

  return (
    <>
      <Typography className={classes.substituteDetailsTitle} variant="h5">
        {t("Substitute Details")}
      </Typography>
      <Typography className={classes.subText}>
        {t(
          "These times may not match your schedule exactly depending on district configuration."
        )}
      </Typography>
      <VacancySummary
        vacancySummaryDetails={vacancySummaryDetails}
        onAssignClick={(currentAssignmentInfo: AssignmentFor) => {
          // dispatch({
          //   action: "setVacancyDetailIdsToAssign",
          //   vacancyDetailIdsToAssign: currentAssignmentInfo.vacancyDetailIds,
          // });
          // setStep("preAssignSub");
        }}
        onCancelAssignment={async () => {}}
        notesForSubstitute={values.notesToReplacement}
        setNotesForSubstitute={(notes: string) => {
          setFieldValue("notesToReplacement", notes);
        }}
        showPayCodes={false}
        showAccountingCodes={false}
        isAbsence={true}
        noDaysChosenText={t("Select Date(s), Reason, and Times...")}
        absenceActions={absenceActions}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subText: {
    color: theme.customColors.edluminSubText,
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
