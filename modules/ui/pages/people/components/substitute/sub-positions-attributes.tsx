import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ToolTip } from "ui/components/tool-tip";
import { useTranslation } from "react-i18next";
import { parseISO } from "date-fns";
import { useHistory } from "react-router";
import { Maybe, PositionType, PermissionEnum } from "graphql/server-types.gen";
import {
  PersonViewRoute,
  PeopleSubPositionsAttributesEditRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

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
  const showEditButton = !props.editing && props.editable;

  const expired = (expirationDate: string) => {
    const currentDate = new Date();
    return parseISO(expirationDate) <= currentDate ? true : false;
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
                props.attributes?.map((n, i) => (
                  <div key={i}>
                    {n.endorsementName}
                    {n.expirationDate && expired(n.expirationDate) && (
                      <ToolTip message={t("Attribute is expired")} />
                    )}
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
