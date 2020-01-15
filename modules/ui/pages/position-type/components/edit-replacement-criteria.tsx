import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { Input } from "ui/components/form/input";
import { Redirect, useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetPositionTypeById } from "ui/pages/position-type/graphql/position-type.gen";
import { GetAllEndorsementsWithinOrg } from "ui/pages/position-type/graphql/get-all-endorsements.gen";
import { useIsMobile } from "hooks";
import { PageTitle } from "ui/components/page-title";
import { useCallback, useEffect } from "react";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { Maybe, Endorsement } from "graphql/server-types.gen";
import { useDeferredState } from "hooks";
import {
  ReplacementCriteriaEditRoute,
  PositionTypeRoute,
} from "ui/routes/position-type";

type Props = {};

export const ReplacementCriteriaEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(ReplacementCriteriaEditRoute);

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: params.positionTypeId },
  });

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    // props.setSearchText(searchText);
  }, [searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  //TODO: Add SearchText query to back-end
  const getAllEndorsements = useQueryBundle(GetAllEndorsementsWithinOrg, {
    variables: { orgId: params.organizationId }, //, searchText: searchText },
  });

  if (
    getPositionType.state === "LOADING" ||
    getAllEndorsements.state === "LOADING"
  ) {
    return <></>;
  }

  const positionType = getPositionType?.data?.positionType?.byId;
  const endorsements = getAllEndorsements?.data?.orgRef_Endorsement?.all;

  if (!positionType || !endorsements) {
    // Redirect the User back to the List page
    const listUrl = PositionTypeRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  //Get Replacement Criteria
  const replacementCriteria = positionType?.replacementCriteria;

  //Add Criteria

  //Remove Criteria

  return (
    <>
      <PageTitle title={t("Replacement Criteria")} withoutHeading={!isMobile} />
      <PageHeader
        text={t("Replacement Criteria - " + positionType.name)}
        label={t("Name")}
      />
      <Grid container className={classes.topPadding}>
        <Grid
          container
          item
          xs={6}
          spacing={2}
          className={classes.rightPadding}
        >
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Minimally/Highly Qualified")} />
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Substitutes must have")} />
              <hr />
              <Grid item xs={12} sm={6} lg={6}>
                {replacementCriteria?.mustHave?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  replacementCriteria?.mustHave?.map((n, i) => (
                    <div key={i}>{n?.name}</div>
                  ))
                )}
              </Grid>
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Prefer that substitutes have")} />
              <hr />
              <Grid item xs={12} sm={6} lg={6}>
                {replacementCriteria?.preferToHave?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  replacementCriteria?.preferToHave?.map((n, i) => (
                    <div key={i}>{n?.name}</div>
                  ))
                )}
              </Grid>
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Prefer that substitutes not have")} />
              <hr />
              <Grid item xs={12} sm={6} lg={6}>
                {replacementCriteria?.mustNotHave?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  replacementCriteria?.mustNotHave?.map((n, i) => (
                    <div key={i}>{n?.name}</div>
                  ))
                )}
              </Grid>
            </Section>
          </Grid>
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Substitutes must not have")} />
              <hr />
              <Grid item xs={12} sm={6} lg={6}>
                {replacementCriteria?.preferToNotHave?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  replacementCriteria?.preferToNotHave?.map((n, i) => (
                    <div key={i}>{n?.name}</div>
                  ))
                )}
              </Grid>
            </Section>
          </Grid>
        </Grid>
        <Grid container item xs={6} component="dl" spacing={2}>
          <Grid item xs={12}>
            <Section>
              <SectionHeader title={t("Available Attributes")} />
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Input
                  label={t("Attributes")}
                  value={pendingSearchText}
                  onChange={updateSearchText}
                  placeholder={t("Search")}
                  className={classes.label}
                />
              </Grid>
              <hr />
              <Grid item xs={12} sm={6} lg={6}>
                {endorsements?.length === 0 ? (
                  <div>{t("Not defined")}</div>
                ) : (
                  endorsements?.map((n, i) => <div key={i}>{n?.name}</div>)
                )}
              </Grid>
              <hr />
            </Section>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  topPadding: {
    paddingTop: theme.spacing(4),
  },
  rightPadding: {
    paddingRight: theme.spacing(4),
  },
  label: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(4),
  },
}));
