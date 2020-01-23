import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { SaveEmployee } from "ui/pages/people/graphql/employee/save-employee.gen";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
import { SectionHeader } from "ui/components/section-header";
import { useCallback } from "react";
import { GetQualifiedEmployeeCountsWithinOrg } from "ui/components/replacement-criteria/graphql/get-qualified-employee-counts.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { ReplacementCriteriaUI } from "ui/components/replacement-criteria/index";
import { useRouteParams } from "ui/routes/definition";
import { Employee } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";

type Props = {};

export const PeopleReplacementCriteriaEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PersonViewRoute);

  const [updateEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getEmployee = useQueryBundle(GetEmployeeById, {
    fetchPolicy: "cache-first",
    variables: { id: params.orgUserId },
  });

  //Mutations
  const updateMustHave = useCallback(
    async (mustHaveInput: string[]) => {
      const result = await updateEmployee({
        variables: {
          employee: {
            id: employee?.id,
            position: {
              replacementCriteria: {
                mustHave: mustHaveInput.map(l => ({ id: l })),
              },
            },
          },
        },
      });
      if (result) {
        await getEmployee.refetch();
        return true;
      }
      return false;
    },
    [updateEmployee]
  );

  const updateMustNot = useCallback(
    async (mustNotInput: string[]) => {
      const result = await updateEmployee({
        variables: {
          employee: {
            id: employee?.id,
            position: {
              replacementCriteria: {
                mustNotHave: mustNotInput.map(l => ({ id: l })),
              },
            },
          },
        },
      });
      if (result) {
        await getEmployee.refetch();
        return true;
      }
      return false;
    },
    [updateEmployee]
  );

  const updatePreferHave = useCallback(
    async (shouldHaveInput: string[]) => {
      const result = await updateEmployee({
        variables: {
          employee: {
            id: employee?.id,
            position: {
              replacementCriteria: {
                shouldHave: shouldHaveInput.map(l => ({ id: l })),
              },
            },
          },
        },
      });
      if (result) {
        await getEmployee.refetch();
        return true;
      }
      return false;
    },
    [updateEmployee]
  );

  const updatePreferNotHave = useCallback(
    async (shouldNotHaveInput: string[]) => {
      const result = await updateEmployee({
        variables: {
          employee: {
            id: employee?.id,
            position: {
              replacementCriteria: {
                shouldNotHave: shouldNotHaveInput.map(l => ({ id: l })),
              },
            },
          },
        },
      });
      if (result) {
        await getEmployee.refetch();
        return true;
      }
      return false;
    },
    [updateEmployee]
  );

  const employee = (getEmployee.state === "LOADING" ||
  getEmployee.state === "UPDATING"
    ? undefined
    : getEmployee.data?.orgUser?.byId?.employee) as Pick<
    Employee,
    "id" | "orgId" | "firstName" | "lastName" | "primaryPosition"
  >;
  const positionId =
    getEmployee.state === "LOADING" || getEmployee.state === "UPDATING"
      ? undefined
      : getEmployee?.data?.orgUser?.byId?.employee?.primaryPosition?.id;

  const position = employee?.primaryPosition;

  //Query qualified numbers
  const getQualifiedNumbers = useQueryBundle(
    GetQualifiedEmployeeCountsWithinOrg,
    {
      variables: {
        orgId: params.organizationId,
        positionId: Number(positionId),
      },
      skip: !position?.id,
    }
  );

  const qualifiedCounts =
    getQualifiedNumbers.state === "LOADING" ||
    getQualifiedNumbers.state === "UPDATING"
      ? undefined
      : getQualifiedNumbers?.data?.position?.qualifiedEmployeeCounts;

  if (!employee) {
    const listUrl = PersonViewRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const postionType = position?.positionType;

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

  //Endorsements to Ignore
  const endorsementsIgnored = mustHave.concat(
    preferToHave,
    preferNotToHave,
    mustNotHave
  );

  return (
    <>
      <SectionHeader
        className={classes.leftPadding}
        title={employee?.firstName + " " + employee?.lastName}
      />
      <ReplacementCriteriaUI
        mustHave={mustHave}
        preferToHave={preferToHave}
        preferToNotHave={preferNotToHave}
        mustNotHave={mustNotHave}
        title={position?.name ?? postionType?.name}
        orgId={params.organizationId}
        handleMust={updateMustHave}
        handleMustNot={updateMustNot}
        handlePrefer={updatePreferHave}
        handlePreferNot={updatePreferNotHave}
        existingMust={mustHave}
        existingMustNot={mustNotHave}
        existingPrefer={preferToHave}
        existingPreferNot={preferNotToHave}
        endorsementsIgnored={endorsementsIgnored}
        numMinimallyQualified={qualifiedCounts?.numMinimallyQualified}
        numFullyQualified={qualifiedCounts?.numFullyQualified}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  leftPadding: {
    paddingLeft: theme.spacing(1),
  },
}));
