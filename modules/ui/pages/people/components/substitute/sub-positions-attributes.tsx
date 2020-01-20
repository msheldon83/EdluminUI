import * as React from "react";
import { Typography, Grid, Button } from "@material-ui/core";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  Maybe,
  Endorsement,
  PositionType,
  PermissionEnum,
} from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";
import {
  PersonViewRoute,
  PeopleSubPositionsAttributesEditRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  editing: string | null;
  attributes?: Maybe<Pick<Endorsement, "name"> | null | undefined>[] | null;
  qualifiedPositionTypes?: Maybe<Pick<PositionType, "name">>[] | null;
};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);

  return (
    <>
      <Section>
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Positions")}</Typography>
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
                props.attributes?.map((n, i) => <div key={i}>{n?.name}</div>)
              )}
            </Grid>
          </Grid>
          <Can do={[PermissionEnum.SubstituteSave]}>
            <Grid
              container
              item
              spacing={0}
              xs={4}
              justify="flex-end"
              alignItems="flex-start"
            >
              <Button
                variant="outlined"
                hidden={!props.editing}
                onClick={() => {
                  const editSettingsUrl = PeopleSubPositionsAttributesEditRoute.generate(
                    params
                  );
                  history.push(editSettingsUrl);
                }}
              >
                {t("Edit")}
              </Button>
            </Grid>
          </Can>
        </Grid>
      </Section>
    </>
  );
};
