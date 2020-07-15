import * as React from "react";
import {
  Grid,
  Typography,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AbsenceDetail, AbsenceFormData } from "../types";
import { startOfDay, min, format } from "date-fns";
import { FormikErrors, useFormikContext } from "formik";
import { NoteField } from "ui/components/absence/absence-details/notes-field";
import { CreateAbsenceCalendar } from "ui/components/absence/create-absence-calendar";
import { sortBy, compact, flatMap } from "lodash-es";
import { AbsenceCreateInput } from "graphql/server-types.gen";
import { GetProjectedAbsenceUsage } from "../graphql/get-projected-absence-usage.gen";
import { useQueryBundle } from "graphql/hooks";
import { BalanceUsage } from "ui/components/absence/balance-usage";
import { AbsenceDays } from "./absence-days";

type Props = {
  employeeId: string;
  organizationId: string;
  actingAsEmployee: boolean;
  onToggleAbsenceDate: (d: Date) => void;
  absenceDates: Date[];
  closedDates?: Date[];
  currentMonth: Date;
  onSwitchMonth: (month: Date) => void;
  absenceInput: AbsenceCreateInput | null;
  positionTypeId?: string;
};

export const AbsenceDetails: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { values, errors, setFieldValue } = useFormikContext<AbsenceFormData>();
  const {
    employeeId,
    organizationId,
    actingAsEmployee,
    onToggleAbsenceDate,
    currentMonth,
    onSwitchMonth,
    absenceInput,
    positionTypeId,
    absenceDates,
    closedDates = [],
  } = props;

  const [negativeBalanceWarning, setNegativeBalanceWarning] = React.useState(
    false
  );

  const getProjectedAbsenceUsage = useQueryBundle(GetProjectedAbsenceUsage, {
    variables: {
      absence: {
        ...absenceInput!,
        ignoreWarnings: true,
      },
    },
    skip: !absenceInput,
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

  return (
    <>
      <Typography variant="h5">{t("Absence Details")}</Typography>
      <div className={classes.calendar}>
        <CreateAbsenceCalendar
          monthNavigation
          selectedAbsenceDates={absenceDates.concat(closedDates)}
          employeeId={employeeId}
          currentMonth={currentMonth}
          onMonthChange={onSwitchMonth}
          onSelectDates={dates => dates.forEach(onToggleAbsenceDate)}
        />
      </div>
      {/* {showClosedDatesBanner && (
          <Grid className={classes.closedDayBanner} item xs={12}>
            <Typography>
              {t("The following days of this absence fall on a closed day:")}
            </Typography>
            {renderClosedDaysBanner}
          </Grid>
        )} */}

      {/* <BalanceUsage
        orgId={organizationId}
        employeeId={employeeId}
        startDate={startOfDay(min(absenceDates))}
        actingAsEmployee={actingAsEmployee}
        usages={absenceBalanceUsages}
        setNegativeBalanceWarning={setNegativeBalanceWarning}
      /> */}

      <div>
        <AbsenceDays
          details={values.details}
          organizationId={organizationId}
          employeeId={employeeId}
          positionTypeId={positionTypeId}
        />
      </div>

      <div className={classes.notesSection}>
        <Typography variant="h6">{t("Notes to administrator")}</Typography>
        <Typography className={classes.subText}>
          {t("Can be seen by the administrator and the employee.")}
        </Typography>

        <NoteField
          onChange={async () => {}}
          name={"notesToApprover"}
          isSubmitted={false}
          initialAbsenceCreation={false}
          value={values.notesToApprover}
          //validationMessage={errors.notesToApprover}
          //required={requireAdminNotes}
        />
      </div>

      {!actingAsEmployee && (
        <div className={classes.notesSection}>
          <Typography variant="h6">{t("Administrator comments")}</Typography>
          <Typography className={classes.subText}>
            {t("Can be seen and edited by administrators only.")}
          </Typography>

          <NoteField
            onChange={async () => {}}
            name={"adminOnlyNotes"}
            isSubmitted={false}
            initialAbsenceCreation={false}
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
  sameOptions: {
    display: "flex",
    justifyContent: "space-between",
  },

  absenceDetailsContainer: {
    paddingBottom: theme.typography.pxToRem(72),
  },
  actionButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  contentFooter: {
    height: theme.typography.pxToRem(72),
    width: theme.customSpacing.contentWidth,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  deleteButton: {
    color: theme.customColors.darkRed,
    marginRight: theme.spacing(2),
    textDecoration: "underline",
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    color: "#050039",
  },
  saveButton: {
    marginRight: theme.spacing(4),
  },
  select: {
    paddingTop: theme.typography.pxToRem(4),
    paddingBottom: theme.spacing(1),
  },
  spacing: {
    paddingRight: theme.spacing(4),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  unsavedText: {
    marginRight: theme.typography.pxToRem(30),
    marginTop: theme.typography.pxToRem(8),
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
