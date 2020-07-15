import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Typography, Grid, Tooltip } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import InfoIcon from "@material-ui/icons/Info";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  Maybe,
  Endorsement,
  PositionType,
  PermissionEnum,
} from "graphql/server-types.gen";
import {
  PersonViewRoute,
  PeopleSubPositionsAttributesEditRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  editing: string | null;
  editable: boolean;
  attributes?:
    | Maybe<Pick<Endorsement, "name" | "expires"> | null | undefined>[]
    | null;
  qualifiedPositionTypes?: Maybe<Pick<PositionType, "name">>[] | null;
};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(PersonViewRoute);
  const showEditButton = !props.editing && props.editable;

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
                props.attributes?.map((n, i) => (
                  <div key={i}>
                    {n?.name}
                    {n?.expires && ToolTip(t)}
                  </div>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  noteText: {
    fontWeight: "bold",
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  sectionBackground: {
    backgroundColor: theme.customColors.lightBlue,
  },
}));

const ToolTip = (t: TFunction) => {
  return (
    <Tooltip
      title={
        <div className={useStyles().tooltip}>
          <Typography variant="body1">{t("Attribute is expired")}</Typography>
        </div>
      }
      placement="right-start"
    >
      <InfoIcon
        color="primary"
        style={{
          fontSize: "16px",
          marginLeft: "8px",
        }}
      />
    </Tooltip>
  );
};
