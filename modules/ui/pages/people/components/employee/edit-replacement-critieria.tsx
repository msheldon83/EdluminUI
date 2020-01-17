import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
import { useCallback, useEffect } from "react";
import { SectionHeader } from "ui/components/section-header";
import { ReplacementCriteriaUI } from "ui/components/replacement-criteria/index";
import { useRouteParams } from "ui/routes/definition";
import { Maybe, Endorsement } from "graphql/server-types.gen";
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

  if (getEmployee.state === "LOADING") {
    return <></>;
  }

  const employee = getEmployee?.data?.orgUser?.byId?.employee;
  const position = employee?.primaryPosition;
  const postionType = position?.positionType;

  if (!employee) {
    const listUrl = PersonViewRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  //Add Criteria Mutations

  //Remove Criteria Mutations

  //Get Replacement Criteria
  const replacementCriteria = position?.replacementCriteria;
  const mustHave =
    replacementCriteria?.mustHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const preferToHave =
    replacementCriteria?.preferToHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const preferNotToHave =
    replacementCriteria?.preferToNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const mustNotHave =
    replacementCriteria?.mustNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];

  return (
    <>
      <SectionHeader
        className={classes.leftPadding}
        title={t(employee?.firstName + " " + employee?.lastName)}
      />
      <ReplacementCriteriaUI
        mustHave={mustHave}
        preferToHave={preferToHave}
        preferToNotHave={preferNotToHave}
        mustNotHave={mustNotHave}
        positionName={position?.name ?? postionType?.name}
        orgId={params.organizationId}
        positionId={position?.id}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  leftPadding: {
    paddingLeft: theme.spacing(1),
  },
}));
