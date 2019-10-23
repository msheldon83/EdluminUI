import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "hooks";
import { makeStyles } from "@material-ui/core";
import { GetPositionTypeById } from "ui/pages/position-type/position-type.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { oc } from "ts-optchain";
import { Grid } from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import { minutesToHours, boolToDisplay } from "ui/components/helpers";
import { getDisplayName } from "ui/components/enumHelpers";
import { Redirect } from "react-router";

type Props = {
  match: Match;
};
type Match = {
  params: MatchParams;
};
type MatchParams = {
  positionTypeId: number;
};

export const PositionTypeViewPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isSmDown = useBreakpoint("sm", "down");
  const {
    match: {
      params: { positionTypeId },
    },
  } = props;

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: positionTypeId },
  });

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const positionType = oc(getPositionType).data.positionType.byId();
  if (!positionType) {
    // Redirect the User back to the List page
    return <Redirect to={"../position-type"} />;
  }

  return (
    <>
      {isSmDown && <PageTitle title={t("Position Type")} />}
      <div className={classes.header}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <h1 className={classes.headerText}>{positionType.name}</h1>
          </Grid>
          <Grid item>
            <Edit className={classes.action} />
          </Grid>
        </Grid>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            {`${t("External Id")} ${positionType.externalId || "[NONE]"}`}
          </Grid>
          <Grid item>
            <Edit className={classes.smallAction} />
          </Grid>
        </Grid>
      </div>
      <Section>
        <SectionHeader
          title={t("Settings")}
          action={{
            text: t("Edit"),
            execute: () => {},
          }}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={6}>
            <div className={classes.label}>{t("Use For Employees")}</div>
            <div>{boolToDisplay(t, positionType.forPermanentPositions)}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <div className={classes.label}>
              {t("Needs Substitute (default)")}
            </div>
            <div>
              {positionType.needsReplacement &&
                getDisplayName(
                  "needsReplacement",
                  positionType.needsReplacement.toString(),
                  t
                )}
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.label}>{t("Use For Vacancies")}</div>
            <div>{boolToDisplay(t, positionType.forStaffAugmentation)}</div>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.label}>{t("Minimum Absence Duration")}</div>
            <div>
              {`${minutesToHours(
                positionType.minAbsenceDurationMinutes,
                2
              )} hour(s)`}
            </div>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: "20px",
  },
  headerText: {
    margin: 0,
  },
  action: {
    cursor: "pointer",
  },
  smallAction: {
    cursor: "pointer",
    height: "0.75em",
  },
  label: {
    fontWeight: 500,
  },
}));
