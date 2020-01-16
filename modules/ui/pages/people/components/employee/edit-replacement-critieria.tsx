import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { Input } from "ui/components/form/input";
import { Redirect, useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
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
  PeopleReplacementCriteriaEditRoute,
  PersonViewRoute,
} from "ui/routes/people";

type Props = {};

export const PeopleReplacementCriteriaEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: { id: params.orgUserId },
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
    variables: { orgId: params.organizationId, searchText: searchText },
  });

  if (
    getEmployee.state === "LOADING" ||
    getAllEndorsements.state === "LOADING"
  ) {
    return <></>;
  }

  const employee = getEmployee?.data?.orgUser?.byId?.employee;
  const position = employee?.primaryPosition;
  const endorsements = getAllEndorsements?.data?.orgRef_Endorsement?.all;

  if (!position || !endorsements) {
    // Redirect the User back to the List page
    const listUrl = PersonViewRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  //Get Replacement Criteria
  const replacementCriteria = position?.replacementCriteria;

  //Add Criteria

  //Remove Criteria

  return (
    <>
      <SectionHeader
        className={classes.leftPadding}
        title={t(employee?.firstName + " " + employee?.lastName)}
      />
      <PageTitle title={t("Replacement Criteria")} withoutHeading={!isMobile} />
      <PageHeader
        text={t("Replacement Criteria - " + position.name)}
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
              <div className={classes.fontColorGrey}>Add selected to:</div>

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
    paddingRight: theme.spacing(3),
  },
  leftPadding: {
    paddingLeft: theme.spacing(1),
  },
  label: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(4),
  },
  fontColorGrey: {
    color: theme.customColors.appBackgroundGray,
  },
}));
