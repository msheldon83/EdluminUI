import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Maybe, Employee, PermissionEnum } from "graphql/server-types.gen";

type Props = {
  editing: string | null;
  editable: boolean;
  substitutePools?: Maybe<{
    blockedEmployees: Maybe<Pick<Employee, "firstName" | "lastName">>[] | null;
    favoriteEmployees: Maybe<Pick<Employee, "firstName" | "lastName">>[] | null;
  }> | null;
};

export const SubstitutePreferences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const showEditButton = !props.editing && props.editable;

  const favoriteEmployees = props?.substitutePools?.favoriteEmployees;
  const blockedEmployees = props?.substitutePools?.blockedEmployees;

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Substitute preferences")}
          actions={[
            {
              text: t("Edit"),
              visible: showEditButton,
              execute: () => {
                const editSettingsUrl = "/"; //TODO figure out the URL for editing
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.EmployeeSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Favorites")}</Typography>
              {favoriteEmployees?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                favoriteEmployees?.map((n, i) => (
                  <div key={i}>{n?.firstName + " " + n?.lastName}</div>
                ))
              )}
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Blocked")}</Typography>
              {blockedEmployees?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                blockedEmployees?.map((n, i) => (
                  <div key={i}>{n?.firstName + " " + n?.lastName}</div>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
