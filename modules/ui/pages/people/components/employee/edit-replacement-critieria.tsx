import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
import { GetAllEndorsementsWithinOrg } from "ui/pages/position-type/graphql/get-all-endorsements.gen";
import { PageTitle } from "ui/components/page-title";
import { useCallback, useEffect } from "react";
import { SectionHeader } from "ui/components/section-header";
import { ReplacementCriteriaUI } from "ui/components/replacement-criteria/index";
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
    const listUrl = PersonViewRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  //Get Replacement Criteria
  const replacementCriteria = position?.replacementCriteria;

  //Add Criteria

  //Remove Criteria

  //component for 4 sections
  //label
  //list of criteria
  //remove function

  return (
    <>
      <SectionHeader
        className={classes.leftPadding}
        title={t(employee?.firstName + " " + employee?.lastName)}
      />
      <ReplacementCriteriaUI />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  leftPadding: {
    paddingLeft: theme.spacing(1),
  },
}));
