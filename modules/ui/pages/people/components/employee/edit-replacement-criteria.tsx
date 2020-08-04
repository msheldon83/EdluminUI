import * as React from "react";
import { useTranslation } from "react-i18next";
import { SaveEmployee } from "ui/pages/people/graphql/employee/save-employee.gen";
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
import { Employee, OrgUser, Position } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";
import { PersonLinkHeader } from "ui/components/link-headers/person";

type Props = {};

export const PeopleReplacementCriteriaEdit: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const params = useRouteParams(PersonViewRoute);

  const [updateEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetQualifiedEmployeeCountsWithinOrg"],
  });

  const getEmployee = useQueryBundle(GetEmployeeById, {
    fetchPolicy: "cache-first",
    variables: { id: params.orgUserId },
  });

  const employee:
    | (Pick<OrgUser, "firstName" | "lastName" | "orgId"> &
        Pick<Employee, "id" | "primaryPosition">)
    | undefined =
    getEmployee.state === "LOADING"
      ? undefined
      : {
          id: getEmployee.data?.orgUser?.byId?.employee?.id ?? "",
          primaryPosition:
            // TODO: Fix this assertion
            getEmployee.data?.orgUser?.byId?.employee
              ?.primaryPosition as Position,
          firstName: getEmployee.data?.orgUser?.byId?.firstName ?? "",
          lastName: getEmployee.data?.orgUser?.byId?.lastName ?? "",
          orgId: getEmployee.data?.orgUser?.byId?.orgId ?? "",
        };

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
    [employee, getEmployee, updateEmployee]
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
    [employee, getEmployee, updateEmployee]
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
    [employee, getEmployee, updateEmployee]
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
    [employee, getEmployee, updateEmployee]
  );

  const position = employee?.primaryPosition;

  //Query qualified numbers
  const getQualifiedNumbers = useQueryBundle(
    GetQualifiedEmployeeCountsWithinOrg,
    {
      variables: {
        orgId: params.organizationId,
        positionId: position?.id,
      },
      skip: !position?.id,
    }
  );

  const qualifiedCounts =
    getQualifiedNumbers.state === "LOADING" || getEmployee.state === "UPDATING"
      ? undefined
      : getQualifiedNumbers?.data?.position?.qualifiedEmployeeCounts;

  if (getEmployee.state === "DONE" && !employee) {
    const listUrl = PersonViewRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const postionType = position?.positionType;

  // Get Inherited Replacement Criteria
  const inheritedReplacementCriteria =
    position?.positionType?.replacementCriteria;
  const inheritedMustHave =
    inheritedReplacementCriteria?.mustHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
      inherited: true,
      inheritedFromName: postionType?.name,
    })) ?? [];
  const inheritedPreferToHave =
    inheritedReplacementCriteria?.preferToHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
      inherited: true,
      inheritedFromName: postionType?.name,
    })) ?? [];
  const inheritedPreferNotToHave =
    inheritedReplacementCriteria?.preferToNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
      inherited: true,
      inheritedFromName: postionType?.name,
    })) ?? [];
  const inheritedMustNotHave =
    inheritedReplacementCriteria?.mustNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
      inherited: true,
      inheritedFromName: postionType?.name,
    })) ?? [];

  //Get Replacement Criteria
  const replacementCriteria = position?.replacementCriteria;
  const mustHave =
    replacementCriteria?.mustHave
      ?.map(e => ({
        name: e?.name ?? "",
        id: e?.id ?? "",
      }))
      .concat(inheritedMustHave) ?? [];
  const preferToHave =
    replacementCriteria?.preferToHave
      ?.map(e => ({
        name: e?.name ?? "",
        id: e?.id ?? "",
      }))
      .concat(inheritedPreferToHave) ?? [];
  const preferNotToHave =
    replacementCriteria?.preferToNotHave
      ?.map(e => ({
        name: e?.name ?? "",
        id: e?.id ?? "",
      }))
      .concat(inheritedPreferNotToHave) ?? [];
  const mustNotHave =
    replacementCriteria?.mustNotHave
      ?.map(e => ({
        name: e?.name ?? "",
        id: e?.id ?? "",
      }))
      .concat(inheritedMustNotHave) ?? [];

  //Endorsements to Ignore
  const endorsementsIgnored = mustHave.concat(
    preferToHave,
    preferNotToHave,
    mustNotHave
  );

  const title = position?.title ?? postionType?.name;

  return (
    <>
      <PersonLinkHeader
        title={`${t("Replacement Criteria")}${title ? " - " + title : ""}`}
        person={employee}
        params={params}
      />
      <ReplacementCriteriaUI
        mustHave={mustHave}
        preferToHave={preferToHave}
        preferToNotHave={preferNotToHave}
        mustNotHave={mustNotHave}
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
