import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  AbsenceReasonTrackingTypeId,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import * as yup from "yup";

type Props = {
  id: string;
  externalId?: string;
  name: string;
  rowVersion: string;
  isRestricted: boolean;
  requireNotesToAdmin: boolean;
  description?: string;
  allowNegativeBalance: boolean;
  absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
  category?: { id: string; name: string };
  updateNameOrExternalId: (values: {
    name?: string | null;
    externalId?: string | null;
  }) => Promise<any>;
  onDelete: () => void;
};

export const AbsenceReasonViewEditUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const history = useHistory();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const [editing, setEditing] = useState<string | null>(null);

  const translateTracking = useCallback(
    (v: AbsenceReasonTrackingTypeId | undefined) => {
      switch (v) {
        case AbsenceReasonTrackingTypeId.Daily:
          return t("Daily");
        case AbsenceReasonTrackingTypeId.Hourly:
          return t("Hourly");
        case AbsenceReasonTrackingTypeId.Invalid:
          return t("Invalid");
      }
      return "";
    },
    [t]
  );

  const displayBool = useCallback(
    (b: boolean | undefined | null) => {
      switch (b) {
        case true:
          return t("Yes");
        case false:
          return t("No");
      }
      return "";
    },
    [t]
  );

  return (
    <>
      <div className={classes.linkPadding}>
        <Link to={AbsenceReasonRoute.generate(params)} className={classes.link}>
          {t("Return to all absence reasons")}
        </Link>
      </div>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader
        text={props.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        editPermissions={[PermissionEnum.AbsVacSettingsSave]}
        validationSchema={yup
          .object()
          .shape({ value: yup.string().required(t("Name is required")) })}
        onCancel={() => setEditing(null)}
        onSubmit={async value => {
          await props.updateNameOrExternalId({ name: value });
          setEditing(null);
        }}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },

          {
            name: t("Delete"),
            onClick: props.onDelete,
            permissions: [PermissionEnum.AbsVacSettingsDelete],
          },
        ]}
      />
      <PageHeader
        text={props.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={[PermissionEnum.AbsVacSettingsSave]}
        validationSchema={yup
          .object()
          .shape({ value: yup.string().nullable() })}
        onSubmit={async v => {
          await props.updateNameOrExternalId({ externalId: v });
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader
        showLabel
      />
      <Section className={classes.content}>
        <SectionHeader
          title={t("Settings")}
          actions={[
            {
              text: t("Edit"),
              visible: !editing,
              execute: () => {
                const editSettingsUrl = AbsenceReasonEditSettingsRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.AbsVacSettingsSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Description")}</Typography>
            <Typography variant="body1">{props.description}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Tracking Type")}</Typography>
            <Typography variant="body1">
              {translateTracking(props.absenceReasonTrackingTypeId)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Allow negative balances")}</Typography>
            <Typography variant="body1">
              {displayBool(props.allowNegativeBalance)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Restrict absence reason")}</Typography>
            <Typography variant="body1">
              {displayBool(props.isRestricted)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">
              {t("Require notes to administrators")}
            </Typography>
            <Typography variant="body1">
              {displayBool(props.requireNotesToAdmin)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Category")}</Typography>
            <Typography variant="body1">
              {!props.category ? t("None") : props.category?.name}
            </Typography>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: { marginTop: theme.spacing(2) },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    padding: theme.typography.pxToRem(10),
    paddingBottom: theme.typography.pxToRem(15),
  },
}));

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};
