import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { NeedsReplacement, PermissionEnum } from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";
import { useRouteParams } from "ui/routes/definition";
import {
  PersonViewRoute,
  PeopleEmployeePositionEditRoute,
} from "ui/routes/people";
import { DayOfWeek } from "graphql/server-types.gen";
import { compact, flatMap, uniq } from "lodash-es";
import { getDisplayName } from "ui/components/enumHelpers";
import { format } from "date-fns";
import { midnightTime } from "helpers/time";

const editableSections = {
  empPosition: "edit-employee-position",
};

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  positionTitle: string | null | undefined;
  needsReplacement: Maybe<NeedsReplacement>;
  hoursPerFullWorkDay: number | null | undefined;
  contractName: string | null | undefined;
  accountingCodeAllocations?:
    | {
        accountingCode?: {
          name: string;
        } | null;
      }[]
    | null;
  schedules: Array<
    | {
        daysOfTheWeek: DayOfWeek[];
        items: {
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

  const accountingCodes = props.accountingCodeAllocations
    ? props.accountingCodeAllocations
        ?.map(ac => ac?.accountingCode?.name)
        .join(", ") ?? t("None defined")
    : t("None defined");

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Position")}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              props.setEditing(editableSections.empPosition);
              history.push(PeopleEmployeePositionEditRoute.generate(params));
            },
            permissions: [PermissionEnum.EmployeeSave],
          }}
          submit={{
            text: t("Save"),
            visible: props.editing === editableSections.empPosition,
            execute: () => {
              props.setEditing(null);
            },
          }}
          cancel={{
            text: t("Cancel"),
            visible: props.editing === editableSections.empPosition,
            execute: () => {
              props.setEditing(null);
            },
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
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
            <Grid item xs={12}>
              <Typography variant="h6">{t("Accounting Code")}</Typography>
              <div>{accountingCodes}</div>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <div>
                {props.schedules?.map((schedule, i) => {
                  if (schedule) {
                    const formattedDays = schedule.daysOfTheWeek
                      .map(day => getDisplayName("dayOfWeek", day, t))
                      .join(", ");
                    const formattedItems = schedule.items.map(item => {
                      const locationName = item.location.name;
                      const startTime =
                        item.startTime ??
                        item.startPeriod?.standardPeriod?.startTime;
                      const formattedStartTime = format(
                        midnightTime().setSeconds(startTime ?? 0),
                        "h:mm a"
                      );

                      const endTime =
                        item.endTime ?? item.endPeriod?.standardPeriod?.endTime;
                      const formattedEndTime = format(
                        midnightTime().setSeconds(endTime ?? 0),
                        "h:mm a"
                      );
                      return `${formattedStartTime} - ${formattedEndTime}  ${locationName}`;
                    });

                    return (
                      <div key={`schedule-${i}`}>
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
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
