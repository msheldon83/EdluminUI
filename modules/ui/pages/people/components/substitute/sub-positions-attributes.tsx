import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { ErrorOutline, Warning } from "@material-ui/icons";
import { Grid, Tooltip, Typography } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { parseISO } from "date-fns";
import { useHistory } from "react-router";
import { Maybe, PositionType, PermissionEnum } from "graphql/server-types.gen";
import {
  PersonViewRoute,
  PeopleSubPositionsAttributesEditRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import {
  attributeIsExpired,
  attributeIsCloseToExpiring,
  dayWindowForWarning,
} from "ui/pages/sub-positions-attributes/helpers";

type Props = {
  editing: string | null;
  editable: boolean;
  attributes: {
    endorsementName: string | undefined;
    expirationDate: string | undefined;
  }[];
  qualifiedPositionTypes?: Maybe<Pick<PositionType, "name">>[] | null;
};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);
  const classes = useStyles();
  const showEditButton = !props.editing && props.editable;

  const getStatus = (expirationDate?: string): "ok" | "warning" | "expired" => {
    if (!expirationDate) return "ok";
    const dateWarning = { expirationDate: parseISO(expirationDate) };
    if (attributeIsExpired(dateWarning)) return "expired";
    if (attributeIsCloseToExpiring(dateWarning, dayWindowForWarning))
      return "warning";
    return "ok";
  };

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Position types & Attributes")}
          actions={[
            {
              text: t("Edit"),
              visible: showEditButton,
              execute: () => {
                const editSettingsUrl = PeopleSubPositionsAttributesEditRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.SubstituteSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">
                {t("Qualified for position types")}
              </Typography>
              {props.qualifiedPositionTypes?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                props.qualifiedPositionTypes?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )}
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Attributes")}</Typography>
              {props.attributes?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                props.attributes?.map((n, i) => {
                  const status = getStatus(n.expirationDate);
                  return (
                    <Grid
                      container
                      key={i}
                      direction="row"
                      alignItems="center"
                      justify="flex-start"
                    >
                      {status == "expired" ? (
                        <Tooltip title={t("Attribute is expired")}>
                          <Warning
                            className={classes.expired}
                            fontSize="inherit"
                          />
                        </Tooltip>
                      ) : status == "warning" ? (
                        <Tooltip
                          title={t(
                            "Attribute will expire within {{dayWindowForWarning}} days",
                            { dayWindowForWarning }
                          )}
                        >
                          <ErrorOutline
                            className={classes.warning}
                            fontSize="inherit"
                          />
                        </Tooltip>
                      ) : (
                        undefined
                      )}
                      {n.endorsementName}
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  warning: {
    color: theme.customColors.warning,
  },
  expired: {
    color: theme.customColors.darkRed,
  },
}));
