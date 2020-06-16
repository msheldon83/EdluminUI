import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { PermissionEnum, PositionType } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonRoute,
  AbsenceReasonViewEditRoute,
  AbsenceReasonCategoryEditSettingsRoute,
  AbsenceReasonCategoryViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import * as yup from "yup";
import { AbsenceReasonPositionTypesCard } from "./components/abs-reason-position-types-card";
import { ReturnLink } from "ui/components/links/return";

type Props = {
  id: string;
  externalId?: string;
  code?: string;
  name: string;
  rowVersion: string;
  isRestricted?: boolean;
  requireNotesToAdmin?: boolean;
  requiresApproval?: boolean;
  description?: string;
  allowNegativeBalance: boolean;
  category?: { id: string; name: string };
  updateNameOrExternalIdOrPositionTypes: (values: {
    name?: string | null;
    externalId?: string | null;
    allPositionTypes?: boolean | null;
    posititionTypeIds?: string[] | null;
  }) => Promise<any>;
  onDelete: () => void;
  isCategory?: boolean;
  positionTypes?: Pick<PositionType, "id" | "name">[];
  allPositionTypes?: boolean | null;
};

export const AbsenceReasonViewEditUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const history = useHistory();
  const params = useRouteParams(
    props.isCategory
      ? AbsenceReasonCategoryViewEditRoute
      : AbsenceReasonViewEditRoute
  );
  const [editing, setEditing] = useState<string | null>(null);

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
        <ReturnLink
          linkClass={classes.link}
          defaultComingFrom={t("all absence reasons")}
          defaultReturnUrl={AbsenceReasonRoute.generate(params)}
        />
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
          await props.updateNameOrExternalIdOrPositionTypes({ name: value });
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
        label={t("Identifier")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={[PermissionEnum.AbsVacSettingsSave]}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async v => {
          await props.updateNameOrExternalIdOrPositionTypes({ externalId: v });
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
                const editSettingsUrl = props.isCategory
                  ? AbsenceReasonCategoryEditSettingsRoute.generate(params)
                  : AbsenceReasonEditSettingsRoute.generate(params);
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.AbsVacSettingsSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Code")}</Typography>
            <Typography variant="body1">
              {props.code ?? t("Not defined")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Description")}</Typography>
            <Typography variant="body1">{props.description}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">{t("Allow negative balances")}</Typography>
            <Typography variant="body1">
              {displayBool(props.allowNegativeBalance)}
            </Typography>
          </Grid>
          {props.isRestricted && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">
                {t("Restrict absence reason")}
              </Typography>
              <Typography variant="body1">
                {displayBool(props.isRestricted)}
              </Typography>
            </Grid>
          )}
          {props.requireNotesToAdmin != null && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">
                {t("Require notes to administrators")}
              </Typography>
              <Typography variant="body1">
                {displayBool(props.requireNotesToAdmin)}
              </Typography>
            </Grid>
          )}

          {!props.isCategory && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">{t("Category")}</Typography>
              <Typography variant="body1">
                {!props.category ? t("None") : props.category?.name}
              </Typography>
            </Grid>
          )}
          {!props.isCategory && (
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">{t("Requires Approval")}</Typography>
              <Typography variant="body1">
                {displayBool(props.requiresApproval)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Section>

      {!props.isCategory && (
        <AbsenceReasonPositionTypesCard
          absenceReasonId={props.id}
          absenceReasonName={props.name}
          positionTypes={props.positionTypes ?? []}
          allPositionTypes={props.allPositionTypes ?? false}
          updatePositionTypes={props.updateNameOrExternalIdOrPositionTypes}
        />
      )}
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
