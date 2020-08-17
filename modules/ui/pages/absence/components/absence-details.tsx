import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AbsenceFormData, AbsenceDetail } from "../types";
import { startOfDay, min, format, isSameDay, max } from "date-fns";
import { useFormikContext } from "formik";
import { NoteField } from "ui/pages/absence/components/notes-field";
import { CreateAbsenceCalendar } from "ui/components/absence/create-absence-calendar";
import { compact, flatMap, intersection, sortBy } from "lodash-es";
import { AbsenceCreateInput } from "graphql/server-types.gen";
import { GetProjectedAbsenceUsage } from "../graphql/get-projected-absence-usage.gen";
import { useQueryBundle } from "graphql/hooks";
import { AbsenceDays } from "./absence-days";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { BalanceUsage, AbsenceReasonUsageData } from "./balance-usage";
import { useEmployeeScheduleTimes } from "helpers/absence/use-employee-schedule-times";

type Props = {
  absenceId?: string;
  employeeId: string;
  headerText?: string;
  travellingEmployee: boolean;
  organizationId: string;
  actingAsEmployee: boolean;
  onToggleAbsenceDate: (d: Date) => void;
  absenceDates: Date[];
  isClosed?: boolean;
  closedDates?: Date[];
  currentMonth: Date;
  onSwitchMonth: (month: Date) => void;
  projectionInput: AbsenceCreateInput | null;
  positionTypeId?: string;
  onTimeChange: () => void;
  canEditReason: boolean;
  canEditDatesAndTimes: boolean;
  setNegativeBalanceWarning: React.Dispatch<React.SetStateAction<boolean>>;
  initialUsageData?: AbsenceReasonUsageData[];
  deletedAbsenceReasons?: { detailId: string; id: string; name: string }[];
  updateKey?: string;
  isQuickCreate?: boolean;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { values, errors, setFieldValue, dirty } = useFormikContext<
    AbsenceFormData
  >();
  const {
    absenceId,
    employeeId,
    organizationId,
    actingAsEmployee,
    onToggleAbsenceDate,
    currentMonth,
    onSwitchMonth,
    projectionInput,
    positionTypeId,
    absenceDates,
    onTimeChange,
    canEditReason,
    canEditDatesAndTimes,
    setNegativeBalanceWarning,
    initialUsageData,
    travellingEmployee,
    deletedAbsenceReasons,
    updateKey,
    isQuickCreate,
    isClosed = false,
    closedDates = [],
    headerText = t("Absence Details"),
  } = props;

  // Letting the absenceDates from state be the source of record as to what
  // dates are selected. This is due to the fact that the calendar toggles a single
  // date at a time and when multiples are selected via a drag and drop we can't
  // reliably call setFieldValue in Formik for each date without losing some.
  // This adds or removes dates from "details" based on the dates in state.
  React.useEffect(() => {
    let updatedDetails = [
      ...values.details.filter(d =>
        absenceDates.find(a => isSameDay(a, d.date))
      ),
    ];
    const daysToAdd = absenceDates.filter(
      a => !values.details.find(d => isSameDay(a, d.date))
    );
    updatedDetails = sortBy(
      [...updatedDetails, ...daysToAdd.map(d => copyDetail(d, updatedDetails))],
      d => d.date
    );
    setFieldValue("details", updatedDetails, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absenceDates]);

  const employeeScheduleTimes = useEmployeeScheduleTimes(
    employeeId,
    min(absenceDates),
    max(absenceDates)
  );

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...projectionInput!,
        ignoreWarnings: true,
      },
      ignoreAbsenceId: absenceId ?? undefined,
    },
    skip: !projectionInput || isClosed,
    // fetchPolicy: "no-cache",
    onError: () => {
      // This shouldn't prevent the User from continuing on
      // with Absence Create. Any major issues will be caught
      // and reported back to them when calling the Create mutation.
    },
  });

  const absenceBalanceUsages = React.useMemo(() => {
    if (
      !(
        getProjectedAbsenceUsage.state === "DONE" ||
        getProjectedAbsenceUsage.state === "UPDATING"
      )
    )
      return null;

    return compact(
      flatMap(
        getProjectedAbsenceUsage.data.absence?.projectedAbsence?.details,
        d => d?.reasonUsages?.map(ru => ru)
      )
    );
  }, [getProjectedAbsenceUsage]);

  // Keep track of selected Absence Reasons and properly set "requireNotesToApprover" as required
  // if any of the selected Absence Reasons have "requireNotesToAdmin" set to true
  const absenceReasons = useAbsenceReasons(organizationId, positionTypeId);
  React.useEffect(() => {
    const absenceReasonsThatRequireNotes = absenceReasons
      .filter(a => a.requireNotesToAdmin)
      .map(a => a.id);
    const currentSelectedReasons = compact(
      values.details.map(d => d.absenceReasonId)
    );
    const overlap = intersection(
      absenceReasonsThatRequireNotes,
      currentSelectedReasons
    );
    const isRequired = overlap.length > 0;
    if (!values.requireNotesToApprover && !isRequired) {
      // Bail out early if the current value and our calculated
      // value are both falsy
      return;
    }

    if (values.requireNotesToApprover !== isRequired) {
      setFieldValue("requireNotesToApprover", isRequired);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absenceReasons, setFieldValue, t, values.details]);

  return (
    <>
      <Typography variant="h5">{headerText}</Typography>
      <div className={classes.calendar}>
        <CreateAbsenceCalendar
          monthNavigation
          selectedAbsenceDates={absenceDates.concat(closedDates)}
          employeeId={employeeId}
          currentMonth={currentMonth}
          onMonthChange={onSwitchMonth}
          onSelectDates={dates => {
            if (canEditDatesAndTimes) {
              dates.forEach(onToggleAbsenceDate);
            }
          }}
        />
      </div>
      {closedDates.length > 0 && (
        <div className={classes.closedDayBanner}>
          <Typography>
            {t("The following days of this absence fall on a closed day:")}
          </Typography>
          <ul>
            {closedDates.map((c, i) => {
              return (
                <li key={`closed-${i}`}>{format(c, "EEE MMMM d, yyyy")}</li>
              );
            })}
          </ul>
        </div>
      )}

      <BalanceUsage
        orgId={organizationId}
        employeeId={employeeId}
        startDate={startOfDay(min(absenceDates))}
        actingAsEmployee={actingAsEmployee}
        usages={absenceBalanceUsages}
        setNegativeBalanceWarning={setNegativeBalanceWarning}
        initialUsageData={initialUsageData}
        key={updateKey ? updateKey : undefined}
      />

      <div>
        <AbsenceDays
          details={values.details}
          organizationId={organizationId}
          employeeId={employeeId}
          positionTypeId={positionTypeId}
          onTimeChange={onTimeChange}
          canEditReason={canEditReason}
          sameReasonForAllDetails={values.sameReasonForAllDetails}
          canEditTimes={canEditDatesAndTimes}
          sameTimesForAllDetails={values.sameTimesForAllDetails}
          travellingEmployee={travellingEmployee}
          deletedAbsenceReasons={deletedAbsenceReasons}
          isQuickCreate={isQuickCreate}
          scheduleTimes={employeeScheduleTimes}
        />
      </div>

      {!isQuickCreate && (
        <div className={classes.notesSection}>
          <Typography variant="h6">{t("Notes to administrator")}</Typography>
          <Typography className={classes.subText}>
            {t("Can be seen by the administrator and the employee.")}
          </Typography>

          <NoteField
            onChange={async e =>
              setFieldValue(
                "notesToApprover",
                e.target.value,
                !!errors.notesToApprover
              )
            }
            name={"notesToApprover"}
            isSubmitted={!dirty}
            initialAbsenceCreation={!absenceId}
            value={values.notesToApprover}
            validationMessage={errors.notesToApprover}
            required={values.requireNotesToApprover}
          />
        </div>
      )}

      {!actingAsEmployee && !isQuickCreate && (
        <div className={classes.notesSection}>
          <Typography variant="h6">{t("Administrator comments")}</Typography>
          <Typography className={classes.subText}>
            {t("Can be seen and edited by administrators only.")}
          </Typography>

          <NoteField
            onChange={async e =>
              setFieldValue("adminOnlyNotes", e.target.value)
            }
            name={"adminOnlyNotes"}
            isSubmitted={!dirty}
            initialAbsenceCreation={!absenceId}
            value={values.adminOnlyNotes}
          />
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    marginTop: theme.spacing(2),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  notesSection: {
    paddingTop: theme.spacing(3),
  },
  closedDayBanner: {
    marginTop: theme.typography.pxToRem(5),
    backgroundColor: theme.customColors.yellow1,
    padding: theme.typography.pxToRem(10),
    borderRadius: theme.typography.pxToRem(4),
    width: "100%",
  },
}));

// When the User adds a new date selection copy the details
// from the first AbsenceDetail if we have one already
const copyDetail = (
  date: Date,
  existingDetails: AbsenceDetail[]
): AbsenceDetail => {
  if (!existingDetails || existingDetails.length === 0) {
    return { date };
  }

  const firstDetail = existingDetails[0];
  return {
    ...firstDetail,
    id: undefined,
    date: date,
  };
};
