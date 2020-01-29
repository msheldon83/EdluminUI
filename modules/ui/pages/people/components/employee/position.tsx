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
  scheduleNames: Array<string | undefined>;
  locationNames: Array<string | undefined>;
};

export const Position: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PersonViewRoute);
  const history = useHistory();

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
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Position")}</Typography>
              <div>{props.positionTitle ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Location")}</Typography>
              <div>
                {(props.locationNames.length > 0 &&
                  props.locationNames.join(",")) ??
                  t("Not available")}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Needs replacement")}</Typography>
              <div>{props.needsReplacement ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <div>
                {(props.scheduleNames.length > 0 &&
                  props.scheduleNames.join(",")) ??
                  t("Not available")}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Contract")}</Typography>
              <div>{props.contractName ?? t("Not available")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Hours in full day")}</Typography>
              <div>{props.hoursPerFullWorkDay ?? t("Not available")}</div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
