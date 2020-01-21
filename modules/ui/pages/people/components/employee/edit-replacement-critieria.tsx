import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { SaveEmployee } from "ui/pages/people/graphql/employee/save-employee.gen";
import { useTranslation } from "react-i18next";
import { Redirect } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetEmployeeById } from "ui/pages/people/graphql/employee/get-employee-by-id.gen";
import { SectionHeader } from "ui/components/section-header";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { ReplacementCriteriaUI } from "ui/components/replacement-criteria/index";
import { useRouteParams } from "ui/routes/definition";
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

  //Mutations
  const updateMustHave = async (mustHaveInput: string[]) => {
    if (mustHaveInput.length === 0) {
      return;
    }
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
    }
  };

  const updateMustNot = async (mustNotInput: string[]) => {
    if (mustNotInput.length === 0) {
      return;
    }
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
    }
  };

  const updatePreferHave = async (shouldHaveInput: string[]) => {
    if (shouldHaveInput.length === 0) {
      return;
    }
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
    }
  };

  const updatePreferNotHave = async (shouldNotHaveInput: string[]) => {
    if (shouldNotHaveInput.length === 0) {
      return;
    }
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
    }
  };

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

  const endorsementsIgnored = mustHave.concat(
    preferToHave,
    preferNotToHave,
    mustNotHave
  );

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
        handleMust={updateMustHave}
        handleMustNot={updateMustNot}
        handlePrefer={updatePreferHave}
        handlePreferNot={updatePreferNotHave}
        endorsementsIgnored={endorsementsIgnored}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  leftPadding: {
    paddingLeft: theme.spacing(1),
  },
}));
