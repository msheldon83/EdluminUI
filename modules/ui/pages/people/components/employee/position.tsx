import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  NeedsReplacement,
  PermissionEnum,
  PositionAccountingCode,
} from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";
import { useRouteParams } from "ui/routes/definition";
import {
  PersonViewRoute,
  PeopleEmployeePositionEditRoute,
} from "ui/routes/people";
import { DayOfWeek } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";
import {
  sortDaysOfWeek,
  compareDaysOfWeek,
  buildDaysLabel,
} from "helpers/day-of-week";
import { secondsToFormattedHourMinuteString } from "helpers/time";

const editableSections = {
  empPosition: "edit-employee-position",
};

type Props = {
  editing: string | null;
  editable: boolean;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  positionTitle: string | null | undefined;
  positionTypeName: string | null | undefined;
  needsReplacement: Maybe<NeedsReplacement>;
  hoursPerFullWorkDay: number | null | undefined;
  contractName: string | null | undefined;
  accountingCodeAllocations: Pick<
    PositionAccountingCode,
    "accountingCodeId" | "accountingCode" | "allocation"
  >[];
  schedules: Array<
    | {
        daysOfTheWeek: DayOfWeek[];
        items: {
          bellSchedule?: {
            name: string;
          } | null;
          endTime?: number | null | undefined;
          startTime?: number | null | undefined;
          location: {
            name: string;
          };
          startPeriod?: {
            standardPeriod?: {
              startTime: number;
            } | null;
          } | null;
          endPeriod?: {
            standardPeriod?: {
              endTime: number;
            } | null;
          } | null;
        }[];
      }
    | null
    | undefined
  >;
};

export const Position: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PersonViewRoute);
  const history = useHistory();
  const classes = useStyles();

  const showEditButton = !props.editing && props.editable;

  const accountingCodes = props.accountingCodeAllocations
    ? props.accountingCodeAllocations.length > 1
      ? props.accountingCodeAllocations
          ?.map(
            ac =>
              `${ac?.accountingCode?.name} (${(ac?.allocation ?? 0) * 100}%)`
          )
          .join(", ") ?? t("None defined")
      : props.accountingCodeAllocations[0]?.accountingCode?.name ??
        t("None defined")
    : t("None defined");

  const sortedSchedules = props.schedules.sort((a, b) =>
    compareDaysOfWeek(
      sortDaysOfWeek(a?.daysOfTheWeek)[0],
      sortDaysOfWeek(b?.daysOfTheWeek)[0]
    )
  );

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Position")}
          actions={[
            {
              text: t("Edit"),
              visible: showEditButton,
              execute: () => {
                props.setEditing(editableSections.empPosition);
                history.push(PeopleEmployeePositionEditRoute.generate(params));
              },
              permissions: [PermissionEnum.EmployeeSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Position")}</Typography>
              <div>{props.positionTypeName ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Title")}</Typography>
              <div>{props.positionTitle ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Needs replacement")}</Typography>
              <div>
                {props.needsReplacement
                  ? getDisplayName(
                      "needsReplacement",
                      props.needsReplacement,
                      t
                    )
                  : t("Not defined")}
              </div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Contract")}</Typography>
              <div>{props.contractName ?? t("Not available")}</div>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <div>
                {sortedSchedules?.map((schedule, i) => {
                  if (schedule) {
                    const formattedDays = buildDaysLabel(
                      sortDaysOfWeek(schedule.daysOfTheWeek),
                      t
                    );
                    const formattedItems = schedule.items.map(item => {
                      const locationName = item.location.name;
                      const startTime =
                        item.startTime ??
                        item.startPeriod?.standardPeriod?.startTime;
                      const formattedStartTime = secondsToFormattedHourMinuteString(
                        startTime ?? 0
                      );

                      const endTime =
                        item.endTime ?? item.endPeriod?.standardPeriod?.endTime;
                      const formattedEndTime = secondsToFormattedHourMinuteString(
                        endTime ?? 0
                      );
                      return (
                        <div
                          className={classes.scheduleRow}
                          key={`scheduleRow-${i}`}
                        >
                          <div
                            className={classes.timeField}
                          >{`${formattedStartTime} - ${formattedEndTime}`}</div>
                          <div>{`@ ${locationName} (${item.bellSchedule?.name ??
                            t("Custom")})`}</div>
                        </div>
                      );
                    });

                    return (
                      <div
                        key={`schedule-${i}`}
                        className={classes.scheduleDay}
                      >
                        <div>{formattedDays}</div>
                        {formattedItems.map((fi, i) => {
                          return <div key={`schedule-item-${i}`}>{fi}</div>;
                        })}
                      </div>
                    );
                  }
                })}
              </div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Hours in full day")}</Typography>
              <div>{props.hoursPerFullWorkDay ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Accounting Code")}</Typography>
              <div>{accountingCodes}</div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  scheduleDay: {
    paddingBottom: theme.spacing(1),
  },
  scheduleRow: {
    display: "flex",
  },
  timeField: {
    width: theme.spacing(20),
  },
}));
