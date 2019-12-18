import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Button, Typography } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useHistory } from "react-router";
import { GetAbsenceReasonBalances } from "../graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { SingleBalance } from "./single-balance";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";

type Props = {
  employeeId: string | undefined;
  showEdit: boolean;
  editing?: string | null;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  title: string;
};

export const RemainingBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const getAbsenceReasonBalances = useQueryBundle(GetAbsenceReasonBalances, {
    variables: {
      id: props.employeeId,
    },
    skip: !props.employeeId,
  });

  const balances =
    getAbsenceReasonBalances.state === "LOADING"
      ? []
      : getAbsenceReasonBalances.data?.employee?.byId?.absenceReasonBalances ??
        [];

  return (
    <>
      <Section>
        <SectionHeader
          title={props.title}
          action={{
            text: t("Edit"),
            visible: props.showEdit && !props.editing,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container spacing={2} className={classes.container}>
          {getAbsenceReasonBalances.state === "LOADING" ? (
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Loading")}</Typography>
            </Grid>
          ) : balances.length === 0 ? (
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("No balance defined")}</Typography>
            </Grid>
          ) : (
            <>
              <Grid item xs={12}>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                  className={classes.shadedRow}
                >
                  <Grid item xs={8}></Grid>
                  <Grid item xs={1}>
                    <div>{t("Used")}</div>
                  </Grid>
                  <Grid item xs={1}>
                    <div>{t("Planned")}</div>
                  </Grid>
                  <Grid item xs={1}>
                    <div>{t("Remaining")}</div>
                  </Grid>
                </Grid>
              </Grid>
              {balances.map((balance, index) => (
                <Grid item xs={12} key={index}>
                  <SingleBalance
                    key={index}
                    name={balance?.absenceReason?.name ?? ""}
                    initialBalance={balance?.initialBalance ?? 0}
                    usedBalance={balance?.usedBalance ?? 0}
                    plannedBalance={0}
                    remainingBalance={balance?.unusedBalance ?? 0}
                    trackingType={
                      balance?.absenceReasonTrackingTypeId ??
                      ("DAILY" as AbsenceReasonTrackingTypeId)
                    }
                    shadeRow={index % 2 != 0}
                  />
                </Grid>
              ))}
            </>
          )}
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  container: {
    border: `1px solid ${theme.customColors.lightGray}`,
  },
}));
