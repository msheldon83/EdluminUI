import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "hooks";
import {
  AbsenceReasonRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { Link } from "react-router-dom";
import { PageHeader } from "ui/components/page-header";
import { useState, useCallback } from "react";
import { PermissionEnum } from "graphql/server-types.gen";
import * as yup from "yup";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";

type Props = {
  id: string;
  externalId: string;
  name: string;
  rowVersion: string;
  description?: string;
  allowNegativeBalance: boolean;
  expired: boolean;
  validUntil: string;
  isBucket: boolean;
  absenceReasonTrackingTypeId?: string;
};

export const AbsenceReasonViewEditUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const updateName = useCallback((name: string | null | undefined) => {
    console.log("hi", name);
  }, []);

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
          await updateName(value);
          setEditing(null);
        }}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },

          {
            name: t("Delete"),
            onClick: () => {},
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
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader
        showLabel
      />
      <Section>
        <SectionHeader title={t("Settings")} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Description")}</Typography>
            <Typography variant="body1">{props.description}</Typography>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
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
